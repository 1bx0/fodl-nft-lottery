import { BigNumber, providers } from 'ethers'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { AWARDS_LIST, EXCLUDE_LIST, WINNERS_PATH } from './constants'
import { Criteria } from './criteria'
import { BoatliftersCriteria, MembersCriteria, SocialMediaCriteria } from './hardcoded/hardcodedCriteria'
import { StakingCriteria } from './staking/stakingCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import {
  Allocation,
  AllocationWithBreakdown,
  filterAllocation,
  logBreakdown,
  NamedAllocations,
  sumAllocations,
} from './utils'

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
    this.fileName = `./data/snapshot_breakdown_${timestamp}_ETH-${ethereumSnapshotBlock}_MATIC-${maticSnapshotBlock}.json`

    this.rules = [
      new TradingCriteria(ethProvider, ethereumSnapshotBlock),
      new StakingCriteria(ethProvider, ethereumSnapshotBlock, maticProvider, maticSnapshotBlock),
      new BoatliftersCriteria(ethProvider, ethereumSnapshotBlock),
      new SocialMediaCriteria(ethProvider, ethereumSnapshotBlock),
      new MembersCriteria(ethProvider, ethereumSnapshotBlock),
    ]
  }

  private rules: Criteria[]
  private fileName: string

  private getPreviousWinners() {
    let previousWinners: { [address: string]: number } = {}
    const minPrevWinners = AWARDS_LIST.findIndex(({ timestamp }) => timestamp == this.timestamp)
    const requiredAwards = AWARDS_LIST.slice(0, minPrevWinners)
    if (minPrevWinners == 0) previousWinners = {}
    else if (!existsSync(WINNERS_PATH))
      throw (
        `For this timestamp: ${this.timestamp}, file ${WINNERS_PATH} must exist!\n` +
        `Please run lotteries for timestamps: ${requiredAwards.map((e) => e.timestamp)}`
      )
    else {
      previousWinners = JSON.parse(readFileSync(WINNERS_PATH, 'utf-8'))
      const winners = Object.entries(previousWinners).filter(
        ([_, award]) => AWARDS_LIST.find((e) => e.id == award)!.timestamp < this.timestamp
      )
      if (winners.length < minPrevWinners)
        throw (
          `For this timestamp: ${this.timestamp}, file ${WINNERS_PATH} must contain ` +
          `winners for awards: ${requiredAwards.map((e) => e.id)}.\n` +
          `However, only ${JSON.stringify(previousWinners)} was found.\n` +
          `Please run lotteries for timestamps: ${requiredAwards
            .filter((a) => winners.findIndex(([w, award]) => a.id == award) != -1)
            .map((e) => e.timestamp)}`
        )
    }
    return previousWinners
  }

  public async getTicketAllocation() {
    let tickets: Allocation
    let allocationBreakdown: AllocationWithBreakdown

    if (existsSync(this.fileName)) {
      allocationBreakdown = this.loadAllocationBreakdown(this.fileName)
      tickets = Object.fromEntries(Object.entries(allocationBreakdown).map(([k, v]) => [k, v.total]))
    } else {
      const previousWinners: { [address: string]: number } = this.getPreviousWinners()
      await Promise.all(this.rules.map((rule) => rule.countTickets()))
      const allAllocations: NamedAllocations = Object.fromEntries(
        this.rules.flatMap((r) => Object.entries(r.allocations))
      )
      // Exclude addresses on the exclude list and the previous winners and those with 0 tickets
      const exclude = new Set([...EXCLUDE_LIST, ...Object.keys(previousWinners)].map((a) => a.toLowerCase()))
      const eligible = (k: string, v: BigNumber) => !v.isZero() && !exclude.has(k)
      tickets = filterAllocation(sumAllocations(...Object.values(allAllocations)), eligible)
      allocationBreakdown = this.computeAllocationBreakdown(tickets, allAllocations)
      logBreakdown(allocationBreakdown)
      this.storeAllocationBreakdown(allocationBreakdown, this.fileName)
    }
    return { tickets, allocationBreakdown }
  }

  private computeAllocationBreakdown(totals: Allocation, as: NamedAllocations): AllocationWithBreakdown {
    return Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [
        k,
        {
          total: v,
          ...Object.fromEntries(
            Object.entries(as)
              .map(([n, a]: [string, Allocation]) => [n, a[k] || BigNumber.from(0)])
              .filter(([_, v]) => !(v as BigNumber).isZero())
          ),
        },
      ])
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
    return JSON.parse(readFileSync(fileName, 'utf-8'), (_, v) => (typeof v == 'number' ? BigNumber.from(v) : v))
  }
}
