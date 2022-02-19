import dotenv from 'dotenv'
import { BigNumber } from 'ethers'
import { existsSync } from 'fs'
import { EXCLUDE_LIST } from './constants'
import { Criteria } from './criteria'
import { BoatliftersCriteria, SocialMediaCriteria } from './hardcoded/hardcodedCriteria'
import { StakingCriteria } from './staking/stakingCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import {
  Allocation,
  AllocationWithBreakdown,
  computeAllocationBreakdown,
  filterAllocation,
  getFirstBlockBefore,
  loadAllocationBreakdown,
  logBreakdown,
  NamedAllocations,
  storeAllocationBreakdown,
  sumAllocations,
} from './utils'

dotenv.config()

export async function snapshot() {
  // Date from timestamp or last midnight
  const date = new Date(process.env.TIMESTAMP || new Date().toDateString())
  const timestamp = date.getTime() / 1000
  const [ethereumSnapshotBlock, maticSnapshotBlock] = await Promise.all([
    getFirstBlockBefore(timestamp, process.env.ETHEREUM_RPC_PROVIDER || ''),
    getFirstBlockBefore(timestamp, process.env.MATIC_RPC_PROVIDER || ''),
  ])

  console.log(`Taking snapshot at ${date} (${timestamp}) ETH:${ethereumSnapshotBlock} MATIC:${maticSnapshotBlock}`)

  const fileName = `./snapshot_breakdown_${timestamp}_ETH-${ethereumSnapshotBlock}_MATIC-${maticSnapshotBlock}.json`

  const stakingCriteria = new StakingCriteria(ethereumSnapshotBlock, maticSnapshotBlock)
  const rules: Criteria[] = [
    new TradingCriteria(ethereumSnapshotBlock),
    stakingCriteria,
    new BoatliftersCriteria(ethereumSnapshotBlock),
    new SocialMediaCriteria(ethereumSnapshotBlock),
  ]

  let tickets: Allocation
  let allocationBreakdown: AllocationWithBreakdown

  if (existsSync(fileName)) {
    allocationBreakdown = loadAllocationBreakdown(fileName)
    tickets = Object.fromEntries(Object.entries(allocationBreakdown).map(([k, v]) => [k, BigNumber.from(v.total)]))
  } else {
    await Promise.all(rules.map((rule) => rule.countTickets()))
    const allAllocations: NamedAllocations = Object.fromEntries(rules.flatMap((r) => Object.entries(r.allocations)))
    // Exclude addresses on the exclude list and those with 0 tickets
    const exclude = new Set(EXCLUDE_LIST.map((a) => a.toLowerCase()))
    const eligible = (k: string, v: BigNumber) => !v.isZero() && !exclude.has(k)
    tickets = filterAllocation(sumAllocations(...Object.values(allAllocations)), eligible)
    allocationBreakdown = computeAllocationBreakdown(tickets, allAllocations)
    storeAllocationBreakdown(allocationBreakdown, fileName)
  }

  logBreakdown(allocationBreakdown)

  return { tickets, allocationBreakdown, timestamp }
}

export function runLottery(tickets: Allocation, randSeed: string | undefined): string {
  console.log(`Running a lottery with random seed: ${randSeed}`)
  const sortedKeys = Object.keys(tickets).sort()
  const totalTickets = Object.values(tickets).reduce((acc, v) => acc.add(v), BigNumber.from(0))

  // pick random value between 0 and totalTickets - 1
  const randomSeed = BigNumber.from(randSeed)
  let index = randomSeed.mod(totalTickets)
  let i = 0
  while (index.gte(tickets[sortedKeys[i]])) index = index.sub(tickets[sortedKeys[i++]])
  return sortedKeys[i]
}
