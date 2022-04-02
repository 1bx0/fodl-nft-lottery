import dotenv from 'dotenv'
import { BigNumber, Contract, providers, Wallet } from 'ethers'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { AWARDS_LIST, LOTTERY_VRF_ABI, LOTTERY_VRF_ADDRESS, SUBMIT_TX_OVERRIDES, WINNERS_PATH } from './constants'
import { Allocation } from './utils'

dotenv.config()

export class Lottery {
  constructor(private timestamp: number, provider: providers.Provider, private snapshotBlock: number) {
    this.vrf = new Contract(LOTTERY_VRF_ADDRESS, LOTTERY_VRF_ABI, provider)
    try {
      this.signer = new Wallet(process.env.SK || '', provider)
    } catch (e) {
      this.signer = undefined
    }
  }

  private signer?: Wallet
  private vrf: Contract

  public async runLottery(tickets: Allocation): Promise<{ [address: string]: number }> {
    const date = new Date(this.timestamp * 1000)
    const lotteryNumber = Object.values(AWARDS_LIST).findIndex((e) => e.timestamp == this.timestamp)
    if (lotteryNumber == -1) throw `No lottery to run for timestamp: ${this.timestamp} (${date})`

    const randomSeed: BigNumber = await this.getRandomSeed()

    console.log(`Running a lottery with random seed: ${randomSeed.toString()}`)
    const sortedKeys = Object.keys(tickets).sort()
    const totalTickets = Object.values(tickets).reduce((acc, v) => acc.add(v), BigNumber.from(0))

    console.log(`Pick random number between 0 and ${totalTickets.toNumber() - 1}...`)
    let index = randomSeed.mod(totalTickets)
    let i = 0
    while (index.gte(tickets[sortedKeys[i]])) index = index.sub(tickets[sortedKeys[i++]])
    const winner = sortedKeys[i]

    const winners = existsSync(WINNERS_PATH) ? JSON.parse(readFileSync(WINNERS_PATH, 'utf-8')) : {}
    if (!winners[winner]) {
      writeFileSync(WINNERS_PATH, JSON.stringify({ ...winners, [winner]: AWARDS_LIST[lotteryNumber].id }), 'utf-8')
    }

    console.log(`!!!!!!  ${winner} -> ${AWARDS_LIST[lotteryNumber].id} is the ${lotteryNumber + 1}'th winner ${date}`)
    return { ...winners, [winner]: AWARDS_LIST[lotteryNumber].id }
  }

  // Get random seed from chainlink vrf or ask for it and wait
  private async getRandomSeed(): Promise<BigNumber> {
    if (!process.env.FORCE_REDRAW) {
      let randomSeed: BigNumber = await this.queryRandomSeed()
      if (!randomSeed.isZero()) return randomSeed
      console.log(`No random seed for timestamp: ${this.timestamp}...`)
    }
    await this.requestRandomSeed()
    await this.waitForRandomNumber()
    return await this.queryRandomSeed()
  }

  private async queryRandomSeed(): Promise<BigNumber> {
    return this.vrf.callStatic.draw(this.timestamp)
  }

  private async requestRandomSeed() {
    if (!this.signer) throw `Wait for ${this.vrf.address} owner to request a random seed.`

    await this.vrf.connect(this.signer).callStatic.getRandomNumber(this.timestamp)
    const tx = await this.vrf.connect(this.signer).getRandomNumber(this.timestamp, SUBMIT_TX_OVERRIDES)
    console.log(`Sent transaction to request random seed: ${tx.hash} ...`)
    const receipt = await tx.wait()
    console.log(`Transaction to request random seed confirmed: ${receipt.transactionHash}`)
  }

  private async waitForRandomNumber(): Promise<void> {
    console.log(`Awaiting request for ${this.timestamp}...`)
    return new Promise((res) => {
      this.vrf.once(this.vrf.filters.NumberDrawn(this.timestamp), () => res())
    })
  }
}
