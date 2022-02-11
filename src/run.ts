import dotenv from 'dotenv'
import { TradingCriteria } from './trading/tradingCriteria'
import { filterZeroes, sumAllocations } from './utils'

dotenv.config()

const toBlock = Number(process.env.SNAPSHOT_BLOCK)

const rules = [new TradingCriteria()]

async function run() {
  await Promise.all(rules.map((rule) => rule.countTickets(toBlock)))

  const allocationWithZeroes = sumAllocations(...rules.flatMap((rule) => Object.values(rule.allocations)))

  const allocation = filterZeroes(allocationWithZeroes)
  console.log(
    Object.entries(allocation)
      .map(
        ([owner, value]) =>
          `${owner} | ${value.toString()} | ${rules[0].allocations.trading[owner]} | ${
            rules[0].allocations.closedTrade[owner]
          }`
      )
      .join('\n')
  )
}

run().catch(console.error)
