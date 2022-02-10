import dotenv from 'dotenv'
import { NamedAllocations } from './utils'

dotenv.config()

export abstract class Criteria {
  constructor(snapshotBlock: number) {
    this.snapshotBlock = snapshotBlock
  }

  public abstract allocations: NamedAllocations

  public snapshotBlock: number

  public abstract countTickets(): Promise<void>
}
