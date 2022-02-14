import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import {
  FODL_ABI,
  FODL_ADDRESS,
  FODL_DECIMALS,
  MANTISSA,
  RARI_XFODL_ABI,
  RARI_XFODL_ADDRESS,
  RARI_XFODL_DEPLOYMENT_BLOCK,
  XFODL_ABI,
  XFODL_ADDRESS,
  XFODL_DEPLOYMENT_BLOCK,
} from '../constants'
import { Criteria } from '../criteria'
import {
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

dotenv.config()

export class XFodlCriteria extends Criteria {
  constructor(snapshotBlock: number, ticketWindowStartBlock: number) {
    super(snapshotBlock, ticketWindowStartBlock)
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

  public async countTickets() {
    console.log('xFodl Criteria...')

    const [xFodlBalance, xFodlTotalSupply, rariXFodlRate] = await Promise.all([
      this.fodlToken.callStatic.balanceOf(XFODL_ADDRESS, { blockTag: this.snapshotBlock }),
      this.xFodl.callStatic.totalSupply({ blockTag: this.snapshotBlock }),
      this.rariXFodl.callStatic.exchangeRateCurrent({ blockTag: this.snapshotBlock }),
    ])

    const convertRariToXFodl = (amount: BigNumber) => amount.mul(rariXFodlRate).div(MANTISSA)
    const convertXFodlToTickets = (amount: BigNumber) =>
      amount.mul(xFodlBalance).div(xFodlTotalSupply).div(BigNumber.from(10).pow(FODL_DECIMALS)).div(1000)

    const [xFodlHolders, rariXFodlHolders] = await Promise.all([
      getHistoricHolders(this.xFodl, XFODL_DEPLOYMENT_BLOCK, this.snapshotBlock),
      getHistoricHolders(this.rariXFodl, RARI_XFODL_DEPLOYMENT_BLOCK, this.snapshotBlock),
    ])

    const [xFodlBalances, lastDayXFodlTransfers, rariXFodlBalances, lastDayRariXFodlTransfers] = await Promise.all([
      getBalances(this.xFodl, xFodlHolders, this.snapshotBlock),
      getHistoricTransfers(this.xFodl, this.ticketWindowStartBlock, this.snapshotBlock),
      getBalances(this.rariXFodl, rariXFodlHolders, this.snapshotBlock),
      getHistoricTransfers(this.rariXFodl, this.ticketWindowStartBlock, this.snapshotBlock),
    ])

    const adjustedRariTransfers = await convertTransfers(lastDayRariXFodlTransfers, async (transfer: Transfer) => {
      const rate = await this.rariXFodl.callStatic.exchangeRateCurrent({ blockTag: transfer.blockNumber })
      return transfer.amount.mul(rate).div(MANTISSA)
    })

    const lastDayTransfers: Transfer[] = [...lastDayXFodlTransfers, ...adjustedRariTransfers]

    const balances = sumAllocations(xFodlBalances, convertAllocation(rariXFodlBalances, convertRariToXFodl))

    const minBalancesDuringLastDay = getMinimumBalancesDuringLastDay(balances, lastDayTransfers)

    this.allocations.xFodl = convertAllocation(minBalancesDuringLastDay, convertXFodlToTickets)
  }
}
