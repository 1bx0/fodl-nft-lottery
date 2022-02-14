import dotenv from 'dotenv'
import axios from 'axios'
import { Criteria } from '../criteria'
import { NamedAllocations } from '../utils'

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
    this.allocations.hardcoded = (await axios.get(this.url)).data
  }
}
