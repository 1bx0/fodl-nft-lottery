import axios from 'axios'
import dotenv from 'dotenv'
import { BigNumber, ethers } from 'ethers'
import { Lottery } from './lottery'
import { Snapshot } from './snapshot'
import { AllocationWithBreakdown, getBlockAfter, getTimestampOrMidnight } from './utils'

dotenv.config()

// Mandatory env variables
const ethProvider = new ethers.providers.WebSocketProvider(process.env.ETHEREUM_RPC_PROVIDER || '')
const maticProvider = new ethers.providers.WebSocketProvider(process.env.MATIC_RPC_PROVIDER || '')

// Set a timestamp or we use the default
const timestamp = getTimestampOrMidnight(process.env.TIMESTAMP)

export async function run() {
  const [ethereumSnapshotBlock, maticSnapshotBlock] = await Promise.all([
    getBlockAfter(timestamp, ethProvider),
    getBlockAfter(timestamp, maticProvider),
  ])
  const snapshot = new Snapshot(timestamp, ethProvider, ethereumSnapshotBlock, maticProvider, maticSnapshotBlock)
  const lottery = new Lottery(timestamp, ethProvider, ethereumSnapshotBlock)

  const { tickets, allocationBreakdown } = await snapshot.getTicketAllocation()

  await publishBreakdown(timestamp, allocationBreakdown)

  const winners = await lottery.runLottery(tickets)

  await publishWinners(winners)

  console.log('All done!')
  process.exit(0)
}
const publishBreakdown = async (timestamp: number, breakdown: AllocationWithBreakdown) => {
  if (!process.env.OPERATOR) return
  console.log(`Publishing allocation to backend!...`)
  await axios.post(
    `https://api.fodl.finance/snapshot/${timestamp}`,
    JSON.parse(JSON.stringify(breakdown, (_, v) => (v.type! == 'BigNumber' ? BigNumber.from(v.hex).toNumber() : v))),
    { headers: { 'x-forwarded-for': process.env.OPERATOR || '' } }
  )
}

const publishWinners = async (winners: { [address: string]: number }) => {
  if (!process.env.OPERATOR) return
  console.log(`Publishing winners to backend!...`)
  await axios.post(`https://api.fodl.finance/nftGiveawayWinners/`, winners, {
    headers: { 'x-forwarded-for': process.env.OPERATOR || '' },
  })
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
