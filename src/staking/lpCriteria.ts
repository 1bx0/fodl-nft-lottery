import { BigNumber, Contract, ethers, providers } from 'ethers'
import { BLOCKS_PER_DAY_ETHEREUM, BLOCKS_PER_DAY_MATIC, ERC20_ABI, FODL_DECIMALS, LP_STAKING_ABI } from '../constants'
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

export class LpCriteria extends Criteria {
  constructor(
    snapshotBlock: number,
    lpAddress: string,
    private lpDeploymentBlock: number,
    lpStakingAddress: string,
    private provider: providers.Provider,
    fodlTokenAddress: string
  ) {
    super(snapshotBlock)
    this.lp = new Contract(lpAddress, ERC20_ABI, this.provider)
    this.lpStaking = new Contract(lpStakingAddress, LP_STAKING_ABI, this.provider)
    this.fodlToken = new Contract(fodlTokenAddress, ERC20_ABI, this.provider)
  }

  public allocations: NamedAllocations = { lp: {} }

  private lp: Contract
  private lpStaking: Contract
  private fodlToken: Contract

  public async countTickets() {
    const network = (await this.provider.getNetwork()).name
    console.log(`LP ${this.lp.address} on ${network} criteria...`)

    const blocksPerDay = network == 'matic' ? BLOCKS_PER_DAY_MATIC : BLOCKS_PER_DAY_ETHEREUM

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
      getHistoricTransfers(this.lp, this.snapshotBlock - blocksPerDay, this.snapshotBlock),
      this.getHistoricStakingTransfers(this.lpStaking, this.snapshotBlock - blocksPerDay, this.snapshotBlock),
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
