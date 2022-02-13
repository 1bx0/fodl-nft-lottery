import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import { Criteria } from '../criteria'
import {
  convertAllocation,
  getBalances,
  getHistoricHolders,
  getHistoricStakingTransfers,
  getHistoricTransfers,
  getMinimumBalancesDuringLastDay,
  NamedAllocations,
  sumAllocations,
} from '../utils'
import {
  BLOCKS_PER_DAY,
  FODL_ABI,
  FODL_ADDRESS,
  LP_ETH_FODL_ADDRESS,
  LP_ETH_FODL_DEPLOYMENT_BLOCK,
  LP_ETH_FODL_STAKING_ADDRESS,
  LP_STAKING_ABI,
  LP_USDC_FODL_ADDRESS,
  LP_USDC_FODL_DEPLOYMENT_BLOCK,
  LP_USDC_FODL_STAKING_ADDRESS,
  SUSHI_LP_ABI,
  SUSHI_LP_DECIMALS,
} from './constants'

dotenv.config()

class SushiLpCriteria extends Criteria {
  constructor(lpAddress: string, lpDeploymentBlock: number, lpStakingAddress: string, allocationName: string) {
    super()
    this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_PROVIDER)
    this.lp = new Contract(lpAddress, SUSHI_LP_ABI, this.provider)
    this.lpStaking = new Contract(lpStakingAddress, LP_STAKING_ABI, this.provider)
    this.fodlToken = new Contract(FODL_ADDRESS, FODL_ABI, this.provider)
    this.lpDeploymentBlock = lpDeploymentBlock
    this.allocationName = allocationName
  }

  public allocations: NamedAllocations = {}

  private allocationName: string

  private provider: providers.Provider
  private lp: Contract
  private lpDeploymentBlock: number
  private lpStaking: Contract
  private fodlToken: Contract

  public async countTickets(snapshotBlock: number) {
    console.log('countTickets')
    const [lpFodlBalance, lpTotalSupply] = await Promise.all([
      this.fodlToken.callStatic.balanceOf(this.lp.address, { blockTag: snapshotBlock }),
      this.lp.callStatic.totalSupply({ blockTag: snapshotBlock }),
    ])

    const convertLpToTickets = (amount: BigNumber) =>
      amount.mul(lpFodlBalance).div(lpTotalSupply).mul(2).div(BigNumber.from(10).pow(SUSHI_LP_DECIMALS)).div(1000)

    const lpHolders = await getHistoricHolders(this.lp, this.lpDeploymentBlock, snapshotBlock)

    const [lpBalances, lpStakingBalances, lastDayLpTransfers, lastDayLpStakingTransfers] = await Promise.all([
      getBalances(this.lp, lpHolders, snapshotBlock),
      getBalances(this.lpStaking, lpHolders, snapshotBlock),
      getHistoricTransfers(this.lp, snapshotBlock - BLOCKS_PER_DAY, snapshotBlock),
      getHistoricStakingTransfers(this.lpStaking, snapshotBlock - BLOCKS_PER_DAY, snapshotBlock),
    ])

    const balances = sumAllocations(lpBalances, lpStakingBalances)

    const lastDayTransfers = [...lastDayLpTransfers, ...lastDayLpStakingTransfers]

    const minBalancesDuringLastDay = getMinimumBalancesDuringLastDay(balances, lastDayTransfers)

    this.allocations[this.allocationName] = convertAllocation(minBalancesDuringLastDay, convertLpToTickets)
  }
}

export class EthLpCriteria extends SushiLpCriteria {
  constructor() {
    super(LP_ETH_FODL_ADDRESS, LP_ETH_FODL_DEPLOYMENT_BLOCK, LP_ETH_FODL_STAKING_ADDRESS, 'eth-lp')
  }
}

export class UsdcLpCriteria extends SushiLpCriteria {
  constructor() {
    super(LP_USDC_FODL_ADDRESS, LP_USDC_FODL_DEPLOYMENT_BLOCK, LP_USDC_FODL_STAKING_ADDRESS, 'usdc-lp')
  }
}
