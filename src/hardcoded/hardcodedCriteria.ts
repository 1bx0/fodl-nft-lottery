import dotenv from 'dotenv'
import { BigNumber } from 'ethers'
import { BOATLIFTERS_LIST, TICKETS_FOR_BOATLIFTER } from '../constants'
import { Criteria } from '../criteria'
import { Allocation, NamedAllocations } from '../utils'

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
    return Object.fromEntries(BOATLIFTERS_LIST.map((a) => [a.toLowerCase(), BigNumber.from(TICKETS_FOR_BOATLIFTER)]))
  }
}
