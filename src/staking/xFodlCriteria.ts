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
} from './constants'

dotenv.config()

export class XFodlCriteria extends Criteria {
  constructor() {
    super()
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER)
    this.rariXFodl = new Contract(RARI_XFODL_ADDRESS, RARI_XFODL_ABI, this.provider)
    this.xFodl = new Contract(XFODL_ADDRESS, XFODL_ABI, this.provider)
    this.fodlToken = new Contract(FODL_ADDRESS, FODL_ABI, this.provider)
  }

  public allocations: NamedAllocations = { xfodl: {} }
  private provider: providers.Provider
  private rariXFodl: Contract
  private xFodl: Contract
  private fodlToken: Contract

  public async countTickets(snapshotBlock: number) {
    const xFodlBalance = await this.fodlToken.callStatic.balanceOf(XFODL_ADDRESS, { blockTag: snapshotBlock })
    const xFodlTotalSupply = await this.xFodl.callStatic.totalSupply({ blockTag: snapshotBlock })
    const rariXFodlRate = await this.rariXFodl.callStatic.exchangeRateCurrent({ blockTag: snapshotBlock })
    const convertRariToXFodl = (amount: BigNumber) => amount.mul(rariXFodlRate).div(MANTISSA)
    const convertXFodlToTickets = (amount: BigNumber) =>
      amount.mul(xFodlBalance).div(xFodlTotalSupply).div(MANTISSA).div(1000)

    console.log('countTickets')

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

    const minBalances = this.getMinimumBalancesDuringLastDay(balances, lastDayTransfers)

    this.allocations.xFodl = convertAllocation(minBalances, convertXFodlToTickets)
  }

  private getMinimumBalancesDuringLastDay(balances: Allocation, unsertedTransfers: Transfer[]): Allocation {
    const transfers = unsertedTransfers.sort((a, b) =>
      a.blockNumber != b.blockNumber ? b.blockNumber - a.blockNumber : b.logIndex - a.logIndex
    )
    let minimumBalances = { ...balances }
    const updateMinBalances = (balances: Allocation) => {
      Object.entries(balances).forEach(([address, balance]) => {
        if (minimumBalances[address].gt(balance)) minimumBalances[address] = balance
      })
    }

    for (let i = 0; i < transfers.length; ) {
      const blockNumber = transfers[i].blockNumber
      while (i < transfers.length && blockNumber == transfers[i].blockNumber) {
        const t = transfers[i]
        balances[t.from] = balances[t.from].add(t.amount)
        balances[t.to] = balances[t.to].sub(t.amount)
        i++
      }
      updateMinBalances(balances)
    }
    return minimumBalances
  }
}