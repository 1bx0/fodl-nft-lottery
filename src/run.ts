import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { BNB_PRICE_FEEDS, ETH_PRICE_FEEDS, MATIC_PRICE_FEEDS } from './chainlinkPriceFeeds'
import { BNB_FODL_REGISTRY_ADDRESS, FODL_REGISTRY_ADDRESS, MATIC_FODL_REGISTRY_ADDRESS } from './constants'
import { Lottery } from './lottery'
import { Snapshot } from './snapshot'
import { getBlockAfter, getTimestampOrMidnight } from './utils'

dotenv.config()

// Mandatory env variables
const ethChain = {
  provider: new ethers.providers.WebSocketProvider(process.env.ETHEREUM_RPC_PROVIDER || ''),
  fodlRegistryAddress: FODL_REGISTRY_ADDRESS,
  priceFeeds: ETH_PRICE_FEEDS,
}
const polygonChain = {
  provider: new ethers.providers.WebSocketProvider(process.env.MATIC_RPC_PROVIDER || ''),
  fodlRegistryAddress: MATIC_FODL_REGISTRY_ADDRESS,
  priceFeeds: MATIC_PRICE_FEEDS,
}
const bnbChain = {
  provider: new ethers.providers.StaticJsonRpcProvider(process.env.BNB_RPC_PROVIDER || ''),
  fodlRegistryAddress: BNB_FODL_REGISTRY_ADDRESS,
  priceFeeds: BNB_PRICE_FEEDS,
}

// Set a timestamp or we use the default
const timestamp = getTimestampOrMidnight(process.env.TIMESTAMP)

export async function run() {
  const [ethereumSnapshotBlock, polygonSnapshotBlock, bnbSnapshotBlock] = await Promise.all([
    getBlockAfter(timestamp, ethChain.provider),
    getBlockAfter(timestamp, polygonChain.provider),
    getBlockAfter(timestamp, bnbChain.provider),
  ])
  const snapshot = new Snapshot(
    timestamp,
    ethChain,
    ethereumSnapshotBlock,
    bnbChain,
    bnbSnapshotBlock,
    polygonChain,
    polygonSnapshotBlock
  )
  const lottery = new Lottery(timestamp, ethChain.provider, ethereumSnapshotBlock)

  const { tickets } = await snapshot.getTicketAllocation()

  await lottery.runLottery(tickets)

  console.log('All done!')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
