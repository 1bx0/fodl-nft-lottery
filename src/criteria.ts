import { NamedAllocations } from './utils'

export abstract class Criteria {
  constructor(snapshotBlock: number) {
    this.snapshotBlock = snapshotBlock
  }

  public abstract allocations: NamedAllocations

  public snapshotBlock: number

  public abstract countTickets(): Promise<void>
}
