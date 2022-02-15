import dotenv from 'dotenv'
import { BigNumber } from 'ethers'
import { existsSync } from 'fs'
import { EXCLUDE_LIST } from './constants'
import { Criteria } from './criteria'
import { BoatliftersCriteria } from './hardcoded/hardcodedCriteria'
import { EthLpCriteria, MaticLpCriteria, UsdcLpCriteria } from './staking/lpCriteria'
import { XFodlCriteria } from './staking/xFodlCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import {
  Allocation,
  computeAllocationBreakdown,
  exclude,
  filterZeroes,
  loadAllocationBreakdown,
  logBreakdown,
  NamedAllocations,
  storeAllocationBreakdown,
  sumAllocations,
} from './utils'

dotenv.config()

const ethereumSnapshotBlock = Number(process.env.ETHEREUM_SNAPSHOT_BLOCK)
const maticSnapshotBlock = Number(process.env.MATIC_SNAPSHOT_BLOCK)

const rules: Criteria[] = [
  new TradingCriteria(ethereumSnapshotBlock),
  new XFodlCriteria(ethereumSnapshotBlock),
  new EthLpCriteria(ethereumSnapshotBlock),
  new UsdcLpCriteria(ethereumSnapshotBlock),
  new MaticLpCriteria(maticSnapshotBlock),
  new BoatliftersCriteria(),
]

async function run() {
  const fileName = `./snapshot_breakdown_ETH-${ethereumSnapshotBlock}_MATIC-${maticSnapshotBlock}.json`

  let tickets: Allocation
  if (existsSync(fileName)) {
    const allocationBreakdown = loadAllocationBreakdown(fileName)
    tickets = Object.fromEntries(Object.entries(allocationBreakdown).map(([k, v]) => [k, v.total]))
  } else {
    await Promise.all(rules.map((rule) => rule.countTickets()))
    const allAllocations: NamedAllocations = Object.fromEntries(rules.flatMap((r) => Object.entries(r.allocations)))
    tickets = filterZeroes(exclude(sumAllocations(...Object.values(allAllocations)), EXCLUDE_LIST))
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
