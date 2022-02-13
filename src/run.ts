import dotenv from 'dotenv'
import { Criteria } from './criteria'
import {
  LP_ETH_FODL_ADDRESS,
  LP_ETH_FODL_DEPLOYMENT_BLOCK,
  LP_ETH_FODL_STAKING_ADDRESS,
  LP_USDC_FODL_ADDRESS,
  LP_USDC_FODL_DEPLOYMENT_BLOCK,
  LP_USDC_FODL_STAKING_ADDRESS,
} from './staking/constants'
import { LPCriteria } from './staking/lpCriteria'
import { XFodlCriteria } from './staking/xFodlCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import { filterZeroes, sumAllocations } from './utils'

dotenv.config()

const snapshotBlock = Number(process.env.SNAPSHOT_BLOCK)

const rules: Criteria[] = [
  new LPCriteria(
    LP_ETH_FODL_ADDRESS,
    LP_ETH_FODL_DEPLOYMENT_BLOCK,
    LP_ETH_FODL_STAKING_ADDRESS,
    process.env.RPC_PROVIDER
  ),
  new LPCriteria(
    LP_USDC_FODL_ADDRESS,
    LP_USDC_FODL_DEPLOYMENT_BLOCK,
    LP_USDC_FODL_STAKING_ADDRESS,
    process.env.RPC_PROVIDER
  ),
  new TradingCriteria(),
  new XFodlCriteria(),
]

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
