import dotenv from 'dotenv'
import { NamedAllocations } from './utils'

dotenv.config()

export abstract class Criteria {
  constructor(snapshotBlock: number, ticketWindowStartBlock: number) {
    this.snapshotBlock = snapshotBlock
    this.ticketWindowStartBlock = ticketWindowStartBlock
  }

  public abstract allocations: NamedAllocations

  public snapshotBlock: number

  public ticketWindowStartBlock: number

  public abstract countTickets(): Promise<void>
}
