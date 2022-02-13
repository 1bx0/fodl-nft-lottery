import dotenv from 'dotenv'
import { BigNumber, constants, Contract, ethers, providers } from 'ethers'
import { Criteria } from '../criteria'
import {
  Allocation,
  convertAllocation,
  convertTransfers,
  getBalances,
  getHistoricHolders,
  getHistoricTransfers,
  getMinimumBalancesDuringLastDay,
  NamedAllocations,
  sumAllocations,
  Transfer,
} from '../utils'
import {
  BLOCKS_PER_DAY,
  XFODL_ABI,
  XFODL_ADDRESS,
  XFODL_DEPLOYMENT_BLOCK,
  FODL_ADDRESS,
  FODL_ABI,
  RARI_XFODL_ADDRESS,
  RARI_XFODL_ABI,
  RARI_XFODL_DEPLOYMENT_BLOCK,
  MANTISSA,
  FODL_DECIMALS,
} from './constants'

dotenv.config()

export class XFodlCriteria extends Criteria {
  constructor() {
    super()
    this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_PROVIDER)
    this.rariXFodl = new Contract(RARI_XFODL_ADDRESS, RARI_XFODL_ABI, this.provider)
    this.xFodl = new Contract(XFODL_ADDRESS, XFODL_ABI, this.provider)
    this.fodlToken = new Contract(FODL_ADDRESS, FODL_ABI, this.provider)
  }

  public allocations: NamedAllocations = { xFodl: {} }

  private provider: providers.Provider
  private rariXFodl: Contract
  private xFodl: Contract
  private fodlToken: Contract

  public async countTickets(snapshotBlock: number) {
    console.log('countTickets')
    const [xFodlBalance, xFodlTotalSupply, rariXFodlRate] = await Promise.all([
      this.fodlToken.callStatic.balanceOf(XFODL_ADDRESS, { blockTag: snapshotBlock }),
      this.xFodl.callStatic.totalSupply({ blockTag: snapshotBlock }),
      this.rariXFodl.callStatic.exchangeRateCurrent({ blockTag: snapshotBlock }),
    ])

    const convertRariToXFodl = (amount: BigNumber) => amount.mul(rariXFodlRate).div(MANTISSA)
    const convertXFodlToTickets = (amount: BigNumber) =>
      amount.mul(xFodlBalance).div(xFodlTotalSupply).div(BigNumber.from(10).pow(FODL_DECIMALS)).div(1000)

    const [xFodlHolders, rariXFodlHolders] = await Promise.all([
      getHistoricHolders(this.xFodl, XFODL_DEPLOYMENT_BLOCK, snapshotBlock),
      getHistoricHolders(this.rariXFodl, RARI_XFODL_DEPLOYMENT_BLOCK, snapshotBlock),
    ])

    const [xFodlBalances, lastDayXFodlTransfers, rariXFodlBalances, lastDayRariXFodlTransfers] = await Promise.all([
      getBalances(this.xFodl, xFodlHolders, snapshotBlock),
      getHistoricTransfers(this.xFodl, snapshotBlock - BLOCKS_PER_DAY, snapshotBlock),
      getBalances(this.rariXFodl, rariXFodlHolders, snapshotBlock),
      getHistoricTransfers(this.rariXFodl, snapshotBlock - BLOCKS_PER_DAY, snapshotBlock),
    ])

    const lastDayTransfers: Transfer[] = [
      ...lastDayXFodlTransfers,
      ...convertTransfers(lastDayRariXFodlTransfers, convertRariToXFodl),
    ]

    const balances = sumAllocations(xFodlBalances, convertAllocation(rariXFodlBalances, convertRariToXFodl))

    const minBalancesDuringLastDay = getMinimumBalancesDuringLastDay(balances, lastDayTransfers)

    this.allocations.xFodl = convertAllocation(minBalancesDuringLastDay, convertXFodlToTickets)
  }
}
