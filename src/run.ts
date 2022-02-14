import dotenv from 'dotenv'
import { BigNumber, ethers } from 'ethers'
import { EXCLUDE_LIST, SECONDS_IN_24_HRS } from './constants'
import { Criteria } from './criteria'
import { MaticLpCriteria } from './staking/maticLpCriteria'
import { EthLpCriteria, UsdcLpCriteria } from './staking/sushiLpCriteria'
import { XFodlCriteria } from './staking/xFodlCriteria'
import { TradingCriteria } from './trading/tradingCriteria'
import { exclude, filterZeroes, getBlockAfterTimestamp, sumAllocations } from './utils'

dotenv.config()

async function run() {
  console.log('getting ethereum snapshot block...')

  const ethereumSnapshotBlock = await getBlockAfterTimestamp(
    Number(process.env.SNAPSHOT_TIMESTAMP),
    new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_PROVIDER)
  )

  console.log('ethereum snapshot block = ', ethereumSnapshotBlock)
  console.log('getting ethereum ticketWindowStart block...')

  const ethereumTicketWindowStartBlock = await getBlockAfterTimestamp(
    Number(process.env.SNAPSHOT_TIMESTAMP) - SECONDS_IN_24_HRS,
    new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_PROVIDER)
  )

  console.log('ethreum ticketWindowStartBlock = ', ethereumTicketWindowStartBlock)
  console.log('getting maticSnapshotBlock...')

  const maticSnapshotBlock = await getBlockAfterTimestamp(
    Number(process.env.SNAPSHOT_TIMESTAMP),
    new ethers.providers.StaticJsonRpcProvider(process.env.MATIC_RPC_PROVIDER)
  )

  console.log('matic snapshot block = ', maticSnapshotBlock)
  console.log('getting matic ticketWindowStartBlock...')

  const maticTicketWindowStartBlock = await getBlockAfterTimestamp(
    Number(process.env.SNAPSHOT_TIMESTAMP) - SECONDS_IN_24_HRS,
    new ethers.providers.JsonRpcProvider(process.env.MATIC_RPC_PROVIDER)
  )

  console.log('maticTicketWindowStartBlock = ', maticTicketWindowStartBlock)

  const rules: Criteria[] = [
    new TradingCriteria(ethereumSnapshotBlock, ethereumTicketWindowStartBlock),
    new XFodlCriteria(ethereumSnapshotBlock, ethereumTicketWindowStartBlock),
    new EthLpCriteria(ethereumSnapshotBlock, ethereumTicketWindowStartBlock),
    new UsdcLpCriteria(ethereumSnapshotBlock, ethereumTicketWindowStartBlock),
    new MaticLpCriteria(maticSnapshotBlock, maticTicketWindowStartBlock),
  ]

  await Promise.all(rules.map((rule) => rule.countTickets()))

  const allocationWithZeroes = exclude(
    sumAllocations(...rules.flatMap((rule) => Object.values(rule.allocations))),
    EXCLUDE_LIST
  )
  const allocation = filterZeroes(allocationWithZeroes)

  console.log(`owner | total | trading | closed-trade | xfodl | eth-lp | usdc-lp | matic-lp`)
  console.log(
    Object.entries(allocation)
      .map(
        ([owner, value]) =>
          `${owner} | ${value.toString()} |` +
          `${rules[0].allocations.trading[owner] || 0} | ${rules[0].allocations.closedTrade[owner] || 0} | ` +
          `${rules[1].allocations.xFodl[owner] || 0} | ` +
          `${rules[2].allocations.lp[owner] || 0} | ` +
          `${rules[3].allocations.lp[owner] || 0} | ` +
          `${rules[4].allocations.maticLp[owner] || 0}`
      )
      .join('\n')
  )

  if (Number(process.env.RANDOM_LOTTERY_SEED) != 0) {
    const sortedKeys = Object.keys(allocation).sort()
    const totalTickets = Object.values(allocation).reduce((acc, v) => acc.add(v), BigNumber.from(0))
    // pick random value between 0 and totalTickets - 1
    let index = BigNumber.from(Math.floor(Math.random() * totalTickets.toNumber()))
    let i = 0
    while (index.gte(allocation[sortedKeys[i]])) index = index.sub(allocation[sortedKeys[i++]])
    console.log(`winner: ${sortedKeys[i]}`)
  }
}

run().catch(console.error)
