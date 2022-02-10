import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import {
  BLOCKS_PER_DAY_ETHEREUM,
  FODL_ABI,
  FODL_ADDRESS,
  FODL_DECIMALS,
  LP_ETH_FODL_ADDRESS,
  LP_ETH_FODL_DEPLOYMENT_BLOCK,
  LP_ETH_FODL_STAKING_ADDRESS,
  LP_STAKING_ABI,
  LP_USDC_FODL_ADDRESS,
  LP_USDC_FODL_DEPLOYMENT_BLOCK,
  LP_USDC_FODL_STAKING_ADDRESS,
  SUSHI_LP_ABI,
} from '../constants'
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

class SushiLpCriteria extends Criteria {
  constructor(snapshotBlock: number, lpAddress: string, lpDeploymentBlock: number, lpStakingAddress: string) {
    super(snapshotBlock)
    this.provider = new ethers.providers.StaticJsonRpcProvider(process.env.ETHEREUM_RPC_PROVIDER)
    this.lp = new Contract(lpAddress, SUSHI_LP_ABI, this.provider)
    this.lpStaking = new Contract(lpStakingAddress, LP_STAKING_ABI, this.provider)
    this.fodlToken = new Contract(FODL_ADDRESS, FODL_ABI, this.provider)
    this.lpDeploymentBlock = lpDeploymentBlock
  }

  public allocations: NamedAllocations = { lp: {} }

  private provider: providers.Provider
  private lp: Contract
  private lpDeploymentBlock: number
  private lpStaking: Contract
  private fodlToken: Contract

  public async countTickets() {
    console.log(`LP ${this.lp.address} Criteria...`)

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

    this.allocations.lp = convertAllocation(minBalancesDuringLastDay, convertLpToTickets)
  }

  private async getHistoricStakingTransfers(token: Contract, fromBlock: number, toBlock: number): Promise<Transfer[]> {
    const staking = new ethers.Contract(token.address, LP_STAKING_ABI, token.provider)

    const tag = `${Math.random()}-stakingEvents`
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

export class EthLpCriteria extends SushiLpCriteria {
  constructor(snapshotBlock: number) {
    super(snapshotBlock, LP_ETH_FODL_ADDRESS, LP_ETH_FODL_DEPLOYMENT_BLOCK, LP_ETH_FODL_STAKING_ADDRESS)
  }
}

export class UsdcLpCriteria extends SushiLpCriteria {
  constructor(snapshotBlock: number) {
    super(snapshotBlock, LP_USDC_FODL_ADDRESS, LP_USDC_FODL_DEPLOYMENT_BLOCK, LP_USDC_FODL_STAKING_ADDRESS)
  }
}
