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
  computeAllocationBreakdown,
  filterAllocation,
  loadAllocationBreakdown,
  logBreakdown,
  NamedAllocations,
  storeAllocationBreakdown,
  sumAllocations,
} from './utils'

dotenv.config()

const ethereumSnapshotBlock = Number(process.env.ETHEREUM_SNAPSHOT_BLOCK)
const maticSnapshotBlock = Number(process.env.MATIC_SNAPSHOT_BLOCK)

const stakingCriteria = new StakingCriteria(ethereumSnapshotBlock, maticSnapshotBlock)
const rules: Criteria[] = [
  new TradingCriteria(ethereumSnapshotBlock),
  stakingCriteria,
  new BoatliftersCriteria(ethereumSnapshotBlock),
  new SocialMediaCriteria(ethereumSnapshotBlock),
]

async function run() {
  const fileName = `./snapshot_breakdown_ETH-${ethereumSnapshotBlock}_MATIC-${maticSnapshotBlock}.json`

  let tickets: Allocation
  if (existsSync(fileName)) {
    const allocationBreakdown = loadAllocationBreakdown(fileName)
    tickets = Object.fromEntries(Object.entries(allocationBreakdown).map(([k, v]) => [k, BigNumber.from(v.total)]))
  } else {
    await Promise.all(rules.map((rule) => rule.countTickets()))
    const allAllocations: NamedAllocations = Object.fromEntries(rules.flatMap((r) => Object.entries(r.allocations)))
    // Exclude addresses on the exclude list and those with 0 tickets
    const exclude = new Set(EXCLUDE_LIST.map((a) => a.toLowerCase()))
    const eligible = (k: string, v: BigNumber) => !v.isZero() && !exclude.has(k)
    tickets = filterAllocation(sumAllocations(...Object.values(allAllocations)), eligible)
    const allocationBreakdown = computeAllocationBreakdown(tickets, allAllocations)
    logBreakdown(allocationBreakdown)
    storeAllocationBreakdown(allocationBreakdown, fileName)
  }

  if (process.env.RANDOM_LOTTERY_SEED) console.log(`Winner is: ${runLottery(tickets)}`)

  console.log('All done!')
  process.exit(0)
}

function runLottery(tickets: Allocation): string {
  console.log(`Running a lottery with random seed: ${process.env.RANDOM_LOTTERY_SEED}`)
  const sortedKeys = Object.keys(tickets).sort()
  const totalTickets = Object.values(tickets).reduce((acc, v) => acc.add(v), BigNumber.from(0))

  // pick random value between 0 and totalTickets - 1
  const randomSeed = BigNumber.from(process.env.RANDOM_LOTTERY_SEED)
  let index = randomSeed.mod(totalTickets)
  let i = 0
  while (index.gte(tickets[sortedKeys[i]])) index = index.sub(tickets[sortedKeys[i++]])
  return sortedKeys[i]
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
