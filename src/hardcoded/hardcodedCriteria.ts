import dotenv from 'dotenv'
import axios from 'axios'
import { Criteria } from '../criteria'
import { NamedAllocations } from '../utils'
import { BigNumber } from 'ethers'

dotenv.config()
export class HardcodedCriteria extends Criteria {
  constructor(url: string) {
    super(0)
    this.url = url
  }

  public allocations: NamedAllocations = { hardcoded: {} }

  private url: string

  public async countTickets() {
    console.log('Matic LP Criteria...')
    const res = await axios.get(this.url)
    this.allocations.hardcoded = Object.fromEntries(
      Object.entries(res.data).map(([k, v]) => [k.toLowerCase(), BigNumber.from(v)])
    )
  }
}
