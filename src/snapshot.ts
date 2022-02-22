import { BigNumber, providers } from 'ethers'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { EXCLUDE_LIST, WINNERS } from './constants'
import { Criteria } from './criteria'
import { BoatliftersCriteria, SocialMediaCriteria } from './hardcoded/hardcodedCriteria'
import { StakingCriteria } from './staking/stakingCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import { Allocation, AllocationWithBreakdown, filterAllocation, NamedAllocations, sumAllocations } from './utils'

export class Snapshot {
  constructor(
    private timestamp: number,
    ethProvider: providers.Provider,
    ethereumSnapshotBlock: number,
    maticProvider: providers.Provider,
    maticSnapshotBlock: number
  ) {
    console.log(
      `Creating snapshot at: ${new Date(timestamp * 1000)} (${timestamp}) \n` +
        `ETH block number: ${ethereumSnapshotBlock} \n` +
        `MATIC block number: ${maticSnapshotBlock}`
    )
    this.fileName = `./snapshot_breakdown_${this.timestamp}_ETH-${ethereumSnapshotBlock}_MATIC-${maticSnapshotBlock}.json`

    this.rules = [
      new TradingCriteria(ethProvider, ethereumSnapshotBlock),
      new StakingCriteria(ethProvider, ethereumSnapshotBlock, maticProvider, maticSnapshotBlock),
      new BoatliftersCriteria(ethProvider, ethereumSnapshotBlock),
      new SocialMediaCriteria(ethProvider, ethereumSnapshotBlock),
    ]
  }

  private rules: Criteria[]
  private fileName: string

  public async getTicketAllocation() {
    let tickets: Allocation
    let allocationBreakdown: AllocationWithBreakdown

    if (existsSync(this.fileName)) {
      allocationBreakdown = this.loadAllocationBreakdown(this.fileName)
      tickets = Object.fromEntries(Object.entries(allocationBreakdown).map(([k, v]) => [k, BigNumber.from(v.total)]))
    } else {
      await Promise.all(this.rules.map((rule) => rule.countTickets()))
      const allAllocations: NamedAllocations = Object.fromEntries(
        this.rules.flatMap((r) => Object.entries(r.allocations))
      )
      // Exclude addresses on the exclude list and those with 0 tickets
      const exclude = new Set(
        [...EXCLUDE_LIST, ...Object.keys(WINNERS).filter((w) => WINNERS[w] < this.timestamp)].map((a) =>
          a.toLowerCase()
        )
      )
      const eligible = (k: string, v: BigNumber) => !v.isZero() && !exclude.has(k)
      tickets = filterAllocation(sumAllocations(...Object.values(allAllocations)), eligible)
      allocationBreakdown = this.computeAllocationBreakdown(tickets, allAllocations)

      this.storeAllocationBreakdown(allocationBreakdown, this.fileName)
    }

    this.logBreakdown(allocationBreakdown)

    return { tickets, allocationBreakdown }
  }

  private computeAllocationBreakdown(totals: Allocation, as: NamedAllocations): AllocationWithBreakdown {
    return Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [
        k,
        { total: v, ...Object.fromEntries(Object.entries(as).map(([n, a]) => [n, a[k] || BigNumber.from(0)])) },
      ])
    )
  }

  private logBreakdown(allocationWithBreakdown: AllocationWithBreakdown) {
    const critertia = Object.keys(Object.values(allocationWithBreakdown)[0]).sort()
    console.log(`owner | ${critertia.join(' | ')}`)
    console.log(
      Object.entries(allocationWithBreakdown)
        .map(([owner, breakdown]) => `${owner} | ${critertia.map((c) => breakdown[c]).join(' | ')}`)
        .join('\n')
    )
  }

  private storeAllocationBreakdown(source: AllocationWithBreakdown, fileName: string) {
    console.log(`Storing allocation to: ${fileName} ...`)

    writeFileSync(
      fileName,
      JSON.stringify(source, (_, v) => (v.type! == 'BigNumber' ? BigNumber.from(v.hex).toNumber() : v), 2),
      'utf-8'
    )
  }

  private loadAllocationBreakdown(fileName: string): AllocationWithBreakdown {
    console.log(`Loading allocation from: ${fileName} ...`)
    return JSON.parse(readFileSync(fileName, 'utf-8'))
  }
}
