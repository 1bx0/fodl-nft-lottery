import axios from 'axios'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { WINNERS_PATH } from './constants'

dotenv.config()

export async function run() {
  const winners = JSON.parse(readFileSync(WINNERS_PATH, 'utf-8'))
  console.log(winners)
  if (!process.env.OPERATOR) return
  console.log(`Publishing winners to backend!...`)
  await axios.post(`https://api.fodl.finance/nftGiveawayWinners/`, winners, {
    headers: { 'x-forwarded-for': process.env.OPERATOR || '' },
  })

  console.log('All done!')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(-1)
})
