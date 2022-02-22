import dotenv from 'dotenv'
import { Lottery } from './lottery'
import { Snapshot } from './snapshot'
import { getFirstBlockBefore, getTimestampForSnapshot } from './utils'

dotenv.config()

export async function run() {
  const timestamp = getTimestampForSnapshot()
  const [ethereumSnapshotBlock, maticSnapshotBlock] = await Promise.all([
    getFirstBlockBefore(timestamp, process.env.ETHEREUM_RPC_PROVIDER || ''),
    getFirstBlockBefore(timestamp, process.env.MATIC_RPC_PROVIDER || ''),
  ])
  const snapshot = new Snapshot(timestamp, ethereumSnapshotBlock, maticSnapshotBlock)
  const lottery = new Lottery(timestamp, ethereumSnapshotBlock)

  const { tickets } = await snapshot.getTicketAllocation()

  await lottery.runLottery(tickets)

  console.log('All done!')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
