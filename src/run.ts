import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { Lottery } from './lottery'
import { Snapshot } from './snapshot'
import { getBlockBefore, getTimestampOrMidnight } from './utils'

dotenv.config()

// Mandatory env variables
const ethProvider = new ethers.providers.WebSocketProvider(process.env.ETHEREUM_RPC_PROVIDER || '')
const maticProvider = new ethers.providers.WebSocketProvider(process.env.MATIC_RPC_PROVIDER || '')

// Set a timestamp or we use the default
const timestamp = getTimestampOrMidnight(process.env.TIMESTAMP)

export async function run() {
  const [ethereumSnapshotBlock, maticSnapshotBlock] = await Promise.all([
    getBlockBefore(timestamp, ethProvider),
    getBlockBefore(timestamp, maticProvider),
  ])
  const snapshot = new Snapshot(timestamp, ethProvider, ethereumSnapshotBlock, maticProvider, maticSnapshotBlock)
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
