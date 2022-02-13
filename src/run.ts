import dotenv from 'dotenv'
import { Criteria } from './criteria'
import { XFodlCriteria } from './staking/xFodlCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import { filterZeroes, sumAllocations } from './utils'

dotenv.config()

const snapshotBlock = Number(process.env.SNAPSHOT_BLOCK)

const rules: Criteria[] = [new XFodlCriteria()]

async function run() {
  await Promise.all(rules.map((rule) => rule.countTickets(snapshotBlock)))

  const allocationWithZeroes = sumAllocations(...rules.flatMap((rule) => Object.values(rule.allocations)))

  const allocation = filterZeroes(allocationWithZeroes)

  console.log(
    Object.entries(allocation)
      .map(([owner, value]) => `${owner} | ${value.toString()}`)
      .join('\n')
  )
  // do lottery
}

run().catch(console.error)
