import dotenv from 'dotenv'
import { Criteria } from './criteria'
import { EthLpCriteria } from './staking/sushiLpCriteria'
import { filterZeroes, sumAllocations } from './utils'

dotenv.config()

const ethereumSnapshotBlock = Number(process.env.ETHERUM_SNAPSHOT_BLOCK)
const maticSnapshotBlock = Number(process.env.MATIC_SNAPSHOT_BLOCK)

const rules: Criteria[] = [
  // new TradingCriteria(),
  // new XFodlCriteria(),
  new EthLpCriteria(),
  // new UsdcLpCriteria(),
  // new MaticLpCriteria(),
]

async function run() {
  await Promise.all(rules.map((rule) => rule.countTickets(ethereumSnapshotBlock)))

  const allocationWithZeroes = sumAllocations(...rules.flatMap((rule) => Object.values(rule.allocations)))

  const allocation = filterZeroes(allocationWithZeroes)

  console.log(`owner | total | trading | closed-trade | eth-lp | usdc-lp | matic-lp`)
  console.log(
    Object.entries(allocation)
      .map(
        ([owner, value]) => `${owner} | ${value.toString()}`
        // `${rules[0].allocations.trading} | ${rules[0].allocations.closedTrade} | ` +
        // `${rules[1].allocations.xFodl} `
      )
      .join('\n')
  )
  // do lottery
}

run().catch(console.error)
