import dotenv from 'dotenv'
import { BigNumber, ethers } from 'ethers'
import { Criteria } from './criteria'
import { MaticLpCriteria } from './staking/maticLpCriteria'
import { EthLpCriteria, UsdcLpCriteria } from './staking/sushiLpCriteria'
import { XFodlCriteria } from './staking/xFodlCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import { exclude, filterZeroes, sumAllocations } from './utils'

dotenv.config()

const ethereumSnapshotBlock = Number(process.env.ETHEREUM_SNAPSHOT_BLOCK)
const maticSnapshotBlock = Number(process.env.MATIC_SNAPSHOT_BLOCK)

const rules: Criteria[] = [
  // new TradingCriteria(ethereumSnapshotBlock),
  new XFodlCriteria(ethereumSnapshotBlock),
  // new EthLpCriteria(ethereumSnapshotBlock),
  // new UsdcLpCriteria(ethereumSnapshotBlock),
  // new MaticLpCriteria(maticSnapshotBlock),
]

async function run() {
  await Promise.all(rules.map((rule) => rule.countTickets()))

  const allocationWithZeroes = sumAllocations(...rules.flatMap((rule) => Object.values(rule.allocations)))

  const allocationBeforeBlacklist = filterZeroes(allocationWithZeroes)
  const allocation = exclude(allocationBeforeBlacklist, EXCLUDE_LIST)

  console.log(`owner | total | trading | closed-trade | eth-lp | usdc-lp | matic-lp`)
  console.log(
    Object.entries(allocation)
      .map(
        ([owner, value]) => `${owner} | ${value.toString()} |` //+
        // `${rules[0].allocations.trading[owner] || 0} | ${rules[0].allocations.closedTrade[owner] || 0} | ` +
        // `${rules[1].allocations.xFodl[owner] || 0} | ` +
        // `${rules[2].allocations.lp[owner] || 0} | ` +
        // `${rules[3].allocations.lp[owner] || 0} | ` +
        // `${rules[4].allocations.maticLp[owner] || 0}`
      )
      .join('\n')
  )

  if (Number(process.env.RANDOM_LOTTERY_SEED) != 0) {
    const sortedKeys = Object.keys(allocation).sort()
    const totalTickets = Object.values(allocation).reduce((acc, v) => acc.add(v), BigNumber.from(0))
    // pick random value between 0 and totalTickets - 1
  }
}

run().catch(console.error)
