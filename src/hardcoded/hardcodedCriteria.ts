import dotenv from 'dotenv'
import axios from 'axios'
import { Criteria } from '../criteria'
import { Allocation, NamedAllocations } from '../utils'
import { BigNumber } from 'ethers'

dotenv.config()

export abstract class HardcodedCriteria extends Criteria {
  constructor(allocationName: string) {
    super(0)
    this.allocationName = allocationName
  }

  public allocations: NamedAllocations = {}

  private allocationName: string

  public async countTickets() {
    this.allocations[this.allocationName] = await this.getAllocation()
  }
  protected abstract getAllocation(): Promise<Allocation>
}

export class BoatliftersCriteria extends HardcodedCriteria {
  constructor() {
    super('boatlifters')
  }

  protected async getAllocation(): Promise<Allocation> {
    const res = await axios.get(process.env.BOATLIFTERS_SNAPSHOT_URL || '')
    return Object.fromEntries(Object.entries(res.data).map(([k, v]) => [k.toLowerCase(), BigNumber.from(v)]))
  }
}
