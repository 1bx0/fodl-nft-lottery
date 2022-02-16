import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import { BLOCKS_PER_DAY_ETHEREUM, ERC20_ABI, FODL_DECIMALS, LP_STAKING_ABI } from '../constants'
import { Criteria } from '../criteria'
import {
  convertAllocation,
  getBalances,
  getHistoricHolders,
  getHistoricTransfers,
  getMinimumBalancesDuringLastDay,
  NamedAllocations,
  parseAddress,
  sumAllocations,
  Transfer,
} from '../utils'

dotenv.config()

export class LpCriteria extends Criteria {
  constructor(
    snapshotBlock: number,
    lpAddress: string,
    lpDeploymentBlock: number,
    lpStakingAddress: string,
    providerUrl: string | undefined,
    fodlTokenAddress: string
  ) {
    super(snapshotBlock)
    this.provider = new ethers.providers.WebSocketProvider(providerUrl!)
    this.lp = new Contract(lpAddress, ERC20_ABI, this.provider)
    this.lpDeploymentBlock = lpDeploymentBlock
    this.lpStaking = new Contract(lpStakingAddress, LP_STAKING_ABI, this.provider)
    this.fodlToken = new Contract(fodlTokenAddress, ERC20_ABI, this.provider)
  }

  public allocations: NamedAllocations = { lp: {} }

  private provider: providers.Provider
  private lp: Contract
  private lpDeploymentBlock: number
  private lpStaking: Contract
  private fodlToken: Contract

  public async countTickets() {
    console.log(`LP ${this.lp.address} on ${(await this.provider.getNetwork()).name} criteria...`)

    const [lpFodlBalance, lpTotalSupply] = await Promise.all([
      this.fodlToken.callStatic.balanceOf(this.lp.address, { blockTag: this.snapshotBlock }),
      this.lp.callStatic.totalSupply({ blockTag: this.snapshotBlock }),
    ])

    const convertLpToTickets = (amount: BigNumber) =>
      amount.mul(lpFodlBalance).div(lpTotalSupply).mul(2).div(BigNumber.from(10).pow(FODL_DECIMALS)).div(1000)

    const lpHolders = await getHistoricHolders(this.lp, this.lpDeploymentBlock, this.snapshotBlock)

    const [lpBalances, lpStakingBalances, lastDayLpTransfers, lastDayLpStakingTransfers] = await Promise.all([
      getBalances(this.lp, lpHolders, this.snapshotBlock),
      getBalances(this.lpStaking, lpHolders, this.snapshotBlock),
      getHistoricTransfers(this.lp, this.snapshotBlock - BLOCKS_PER_DAY_ETHEREUM, this.snapshotBlock),
      this.getHistoricStakingTransfers(
        this.lpStaking,
        this.snapshotBlock - BLOCKS_PER_DAY_ETHEREUM,
        this.snapshotBlock
      ),
    ])

    const balances = sumAllocations(lpBalances, lpStakingBalances)

    const lastDayTransfers = [...lastDayLpTransfers, ...lastDayLpStakingTransfers]

    const minBalancesDuringLastDay = getMinimumBalancesDuringLastDay(balances, lastDayTransfers)

    Object.assign(this.allocations.lp, convertAllocation(minBalancesDuringLastDay, convertLpToTickets))
  }

  private async getHistoricStakingTransfers(token: Contract, fromBlock: number, toBlock: number): Promise<Transfer[]> {
    const staking = new ethers.Contract(token.address, LP_STAKING_ABI, token.provider)

    const tag = `stakingEvents-${token.address}`
    console.time(tag)
    const [stakeLogs, withdrawLogs] = await Promise.all([
      staking.queryFilter(staking.filters.Staked(), fromBlock, toBlock),
      staking.queryFilter(staking.filters.Withdrawn(), fromBlock, toBlock),
    ])
    console.timeEnd(tag)

    return [
      ...stakeLogs.map((log) => ({
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        from: ethers.constants.AddressZero,
        to: parseAddress(log.topics[1]),
        amount: BigNumber.from(log.data),
      })),
      ...withdrawLogs.map((log) => ({
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        from: parseAddress(log.topics[1]),
        to: ethers.constants.AddressZero,
        amount: BigNumber.from(log.data),
      })),
    ]
  }
}
