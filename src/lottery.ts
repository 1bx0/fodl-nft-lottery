import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, Wallet } from 'ethers'
import { LOTTERY_TIMESTAMPS, LOTTERY_VRF_ABI, LOTTERY_VRF_ADDRESS, SUBMIT_TX_OVERRIDES } from './constants'
import { Allocation } from './utils'

dotenv.config()

export class Lottery {
  constructor(private timestamp: number, private snapshotBlock: number) {
    const provider = new ethers.providers.WebSocketProvider(process.env.ETHEREUM_RPC_PROVIDER || '')
    this.signer = new Wallet(process.env.SK || '', provider)
    this.vrf = new Contract(LOTTERY_VRF_ADDRESS, LOTTERY_VRF_ABI, provider)
  }

  private signer: Wallet
  private vrf: Contract

  public async runLottery(tickets: Allocation): Promise<string> {
    const date = new Date(this.timestamp * 1000)
    const lotteryNumber = LOTTERY_TIMESTAMPS.indexOf(this.timestamp)
    if (lotteryNumber == -1) {
      console.log(`No lottery to run for timestamp: ${this.timestamp} (${date})`)
      return ''
    }

    const randomSeed: BigNumber = await this.getRandomSeed()

    console.log(`Running a lottery with random seed: ${randomSeed.toString()}`)
    const sortedKeys = Object.keys(tickets).sort()
    const totalTickets = Object.values(tickets).reduce((acc, v) => acc.add(v), BigNumber.from(0))

    console.log(`Pick random number between 0 and ${totalTickets.toNumber() - 1}...`)
    let index = randomSeed.mod(totalTickets)
    let i = 0
    while (index.gte(tickets[sortedKeys[i]])) index = index.sub(tickets[sortedKeys[i++]])
    const winner = sortedKeys[i]

    console.log(`!!!!!! The ${lotteryNumber + 1}'th winner for ${this.timestamp} (${date}) is: ${winner}`)
    return winner
  }

  // Get random seed from chainlink vrf or ask for it and wait
  private async getRandomSeed(): Promise<BigNumber> {
    let randomSeed: BigNumber = await this.queryRandomSeed()
    if (!randomSeed.isZero()) return randomSeed

    console.log(`No random seed for timestamp: ${this.timestamp}...`)
    const requests = await this.getPendingRequests()
    if (requests.length == 0) {
      const owner: string = await this.vrf.callStatic.owner()
      if (owner.toLowerCase() != this.signer.address.toLowerCase()) {
        console.log(`Wait for ${this.vrf.address} owner: ${owner} to request a random seed.`)
        return BigNumber.from(0)
      }
      await this.requestRandomSeed()
    }
    await this.waitForRandomNumber()
    return await this.queryRandomSeed()
  }

  private async queryRandomSeed(): Promise<BigNumber> {
    return this.vrf.callStatic.draw(this.timestamp)
  }

  private async requestRandomSeed() {
    await this.vrf.connect(this.signer).callStatic.getRandomNumber(this.timestamp)
    const tx = await this.vrf.connect(this.signer).getRandomNumber(this.timestamp, SUBMIT_TX_OVERRIDES)
    console.log(`Sent transaction to request random seed: ${tx.hash} ...`)
    const receipt = await tx.wait()
    console.log(`Transaction to request random seed confirmed: ${receipt.hash}`)
  }

  private async getPendingRequests() {
    return this.vrf.queryFilter(this.vrf.filters.RequestSent(this.timestamp), this.snapshotBlock, 'latest')
  }

  private async waitForRandomNumber(): Promise<void> {
    console.log(`Awaiting request for ${this.timestamp}...`)
    return new Promise((res) => {
      this.vrf.once(this.vrf.filters.NumberDrawn(this.timestamp), () => res())
    })
  }
}
