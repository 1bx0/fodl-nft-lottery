import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { BNB_FODL_REGISTRY_ADDRESS, FODL_REGISTRY_ADDRESS, POLYGON_FODL_REGISTRY_ADDRESS } from './constants'
import { Lottery } from './lottery'
import { Snapshot } from './snapshot'
import { getBlockAfter, getTimestampOrMidnight } from './utils'

dotenv.config()

// Mandatory env variables
const ethChain = {
  provider: new ethers.providers.WebSocketProvider(process.env.ETHEREUM_RPC_PROVIDER || ''),
  foldingRegistryAddress: FODL_REGISTRY_ADDRESS,
}
const polygonChain = {
  provider: new ethers.providers.WebSocketProvider(process.env.POLYGON_RPC_PROVIDER || ''),
  foldingRegistryAddress: POLYGON_FODL_REGISTRY_ADDRESS,
}
const bnbChain = {
  provider: new ethers.providers.StaticJsonRpcProvider(process.env.BNB_RPC_PROVIDER || ''),
  foldingRegistryAddress: BNB_FODL_REGISTRY_ADDRESS,
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
  const lottery = new Lottery(timestamp, ethProvider, ethereumSnapshotBlock)

  const { tickets } = await snapshot.getTicketAllocation()

  await lottery.runLottery(tickets)

  console.log('All done!')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
