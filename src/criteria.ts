import dotenv from 'dotenv'
import { NamedAllocations } from './utils'

dotenv.config()

export abstract class Criteria {
  public abstract allocations: NamedAllocations

  public abstract countTickets(currentBlock: number): Promise<void>
}
