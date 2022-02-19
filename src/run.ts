import dotenv from 'dotenv'
import { runLottery, snapshot } from './snapshot'

dotenv.config()

export async function run() {
  const { tickets } = await snapshot()

  if (process.env.RANDOM_LOTTERY_SEED) console.log(`Winner is: ${runLottery(tickets, process.env.RANDOM_LOTTERY_SEED)}`)

  console.log('All done!')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
