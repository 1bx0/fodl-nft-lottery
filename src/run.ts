import dotenv from 'dotenv'
import { BigNumber } from 'ethers'
import { readFileSync, writeFileSync } from 'fs'
import { EXCLUDE_LIST } from './constants'
import { Criteria } from './criteria'
import { HardcodedCriteria } from './hardcoded/hardcodedCriteria'
import { EthLpCriteria, MaticLpCriteria, UsdcLpCriteria } from './staking/lpCriteria'
import { XFodlCriteria } from './staking/xFodlCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import { Allocation, exclude, filterZeroes, sumAllocations } from './utils'

dotenv.config()

const ethereumSnapshotBlock = Number(process.env.ETHEREUM_SNAPSHOT_BLOCK)
const maticSnapshotBlock = Number(process.env.MATIC_SNAPSHOT_BLOCK)

const rules: Criteria[] = [
  new TradingCriteria(ethereumSnapshotBlock),
  new XFodlCriteria(ethereumSnapshotBlock),
  new EthLpCriteria(ethereumSnapshotBlock),
  new UsdcLpCriteria(ethereumSnapshotBlock),
  new MaticLpCriteria(maticSnapshotBlock),
  new HardcodedCriteria(process.env.BOATLIFTERS_SNAPSHOT_URL || ''),
]

async function run() {
  await Promise.all(rules.map((rule) => rule.countTickets()))

  const allocationWithZeroes = exclude(
    sumAllocations(...rules.flatMap((rule) => Object.values(rule.allocations))),
    EXCLUDE_LIST
  )
  const allocation = filterZeroes(allocationWithZeroes)

  writeFileSync(
    `./allocation_ETH-${ethereumSnapshotBlock}_MATIC-${maticSnapshotBlock}.json`,
    JSON.stringify(Object.fromEntries(Object.entries(allocation).map(([k, v]) => [k, v.toNumber()])), null, 2),
    'utf-8'
  )

  console.log(`owner | total | trading | closed-trade | xfodl | eth-lp | usdc-lp | matic-lp | boatlifters`)
  console.log(
    Object.entries(allocation)
      .map(
        ([owner, value]) =>
          `${owner} | ${value.toString()} |` +
          `${rules[0].allocations.trading[owner] || 0} | ${rules[0].allocations.closedTrade[owner] || 0} | ` +
          `${rules[1].allocations.xFodl[owner] || 0} | ` +
          `${rules[2].allocations.lp[owner] || 0} | ` +
          `${rules[3].allocations.lp[owner] || 0} | ` +
          `${rules[4].allocations.lp[owner] || 0} | ` +
          `${rules[5].allocations.hardcoded[owner] || 0} |`
      )
      .join('\n')
  )

  if (process.env.RANDOM_LOTTERY_SEED) {
    console.log(`Running a lottery with random seed: ${process.env.RANDOM_LOTTERY_SEED}`)
    const sortedKeys = Object.keys(allocation).sort()
    const totalTickets = Object.values(allocation).reduce((acc, v) => acc.add(v), BigNumber.from(0))

    // pick random value between 0 and totalTickets - 1
    const randomSeed = BigNumber.from(process.env.RANDOM_LOTTERY_SEED)
    let index = randomSeed.mod(totalTickets)
    let i = 0
    while (index.gte(allocation[sortedKeys[i]])) index = index.sub(allocation[sortedKeys[i++]])
    console.log(`winner: ${sortedKeys[i]}`)
  }
  console.log('All done!')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
