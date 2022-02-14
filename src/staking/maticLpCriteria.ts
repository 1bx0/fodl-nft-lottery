import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import { Criteria } from '../criteria'
import { ERC20_ABI } from '../constants'
import {
  convertAllocation,
  getBalances,
  getHistoricHolders,
  getHistoricTransfers,
  getMinimumBalancesDuringLastDay,
  NamedAllocations,
} from '../utils'
import {
  BLOCKS_PER_DAY_MATIC,
  FODL_ADDRESS_ON_MATIC,
  LP_FODL_MATIC_ADDRESS,
  LP_FODL_MATIC_DEPLOYMENT_BLOCK,
  MATIC_LP_DECIMALS,
  SUSHI_LP_ABI,
} from '../constants'

dotenv.config()

export class MaticLpCriteria extends Criteria {
  constructor(snapshotBlock: number) {
    super(snapshotBlock)
    this.provider = new ethers.providers.JsonRpcProvider(process.env.MATIC_RPC_PROVIDER)
    this.lp = new Contract(LP_FODL_MATIC_ADDRESS, SUSHI_LP_ABI, this.provider)
    this.fodlToken = new Contract(FODL_ADDRESS_ON_MATIC, ERC20_ABI, this.provider)
    this.lpDeploymentBlock = LP_FODL_MATIC_DEPLOYMENT_BLOCK
  }

  public allocations: NamedAllocations = { maticLp: {} }

  private provider: providers.Provider
  private lp: Contract
  private lpDeploymentBlock: number
  private fodlToken: Contract

  public async countTickets() {
    console.log('Matic LP Criteria...')

    const [lpFodlBalance, lpTotalSupply] = await Promise.all([
      this.fodlToken.callStatic.balanceOf(this.lp.address, { blockTag: this.snapshotBlock }),
      this.lp.callStatic.totalSupply({ blockTag: this.snapshotBlock }),
    ])

    const convertLpToTickets = (amount: BigNumber) =>
      amount.mul(lpFodlBalance).div(lpTotalSupply).mul(2).div(BigNumber.from(10).pow(MATIC_LP_DECIMALS)).div(1000)

    const lpHolders = await getHistoricHolders(this.lp, this.lpDeploymentBlock, this.snapshotBlock)

    const [lpBalances, lastDayLpTransfers] = await Promise.all([
      getBalances(this.lp, lpHolders, this.snapshotBlock),
      getHistoricTransfers(this.lp, this.snapshotBlock - BLOCKS_PER_DAY_MATIC, this.snapshotBlock),
    ])

    const minBalancesDuringLastDay = getMinimumBalancesDuringLastDay(lpBalances, lastDayLpTransfers)

    this.allocations.maticLp = convertAllocation(minBalancesDuringLastDay, convertLpToTickets)
  }
}
