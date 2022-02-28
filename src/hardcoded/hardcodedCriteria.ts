import axios from 'axios'
import { BigNumber, Contract, providers } from 'ethers'
import {
  BOATLIFTERS_CONTRACT_ADDRESS,
  BOATLIFTERS_CONTRACT_DEPLOYMENT_BLOCK,
  JSON_LIST_URL_ABI,
  LIST_CONTRACT_ABI,
  MEMBERS_CONTRACT_ADDRESS,
  MEMBERS_CONTRACT_DEPLOYMENT_BLOCK,
  SOCIALMEDIA_CONTRACT_ADDRESS,
  SOCIALMEDIA_CONTRACT_DEPLOYMENT_BLOCK,
  TICKETS_FOR_BOATLIFTER,
  TICKETS_FOR_MEMBER,
  TICKETS_FOR_SOCIALMEDIA,
} from '../constants'
import { Criteria } from '../criteria'
import { Allocation, NamedAllocations } from '../utils'

abstract class HardcodedListCriteria extends Criteria {
  constructor(snapshotBlock: number, private allocationName: string) {
    super(snapshotBlock)
  }
  public allocations: NamedAllocations = {}

  protected abstract getAllocation(): Promise<Allocation>

  public async countTickets() {
    console.log(`${this.allocationName} Criteria...`)
    this.allocations[this.allocationName] = await this.getAllocation()
  }
}
abstract class SCHardcodedListCriteria extends HardcodedListCriteria {
  constructor(
    provider: providers.Provider,
    snapshotBlock: number,
    allocationName: string,
    address: string,
    private deploymentBlock: number,
    private tickets: number
  ) {
    super(snapshotBlock, allocationName)
    this.sc = new Contract(address, LIST_CONTRACT_ABI, provider)
  }

  private sc: Contract

  protected async getAllocation() {
    const list: string[] = await this.sc.callStatic.getAll({
      blockTag: this.snapshotBlock > this.deploymentBlock ? this.snapshotBlock : this.deploymentBlock + 1,
    })
    return Object.fromEntries(list.map((a) => [a.toLowerCase(), BigNumber.from(this.tickets)]))
  }
}

abstract class SCHardcodedJsonUrlCriteria extends HardcodedListCriteria {
  constructor(
    provider: providers.Provider,
    snapshotBlock: number,
    allocationName: string,
    address: string,
    private deploymentBlock: number,
    private tickets: number
  ) {
    super(snapshotBlock, allocationName)
    this.sc = new Contract(address, JSON_LIST_URL_ABI, provider)
  }

  private sc: Contract

  protected async getAllocation() {
    const arweaveUrl: string = await this.sc.callStatic.arweaveUrl({
      blockTag: this.snapshotBlock > this.deploymentBlock ? this.snapshotBlock : this.deploymentBlock + 1,
    })
    const res = await axios.get(arweaveUrl)
    const members = typeof res.data === 'string' ? JSON.parse(res.data.replace(/'/g, '"')) : res.data
    return Object.fromEntries(members.map((a: string) => [a.toLowerCase(), BigNumber.from(this.tickets)]))
  }
}
export class BoatliftersCriteria extends SCHardcodedListCriteria {
  constructor(provider: providers.Provider, snapshotBlock: number) {
    super(
      provider,
      snapshotBlock,
      'boatlifters',
      BOATLIFTERS_CONTRACT_ADDRESS,
      BOATLIFTERS_CONTRACT_DEPLOYMENT_BLOCK,
      TICKETS_FOR_BOATLIFTER
    )
  }
}
export class SocialMediaCriteria extends SCHardcodedListCriteria {
  constructor(provider: providers.Provider, snapshotBlock: number) {
    super(
      provider,
      snapshotBlock,
      'socialmedia',
      SOCIALMEDIA_CONTRACT_ADDRESS,
      SOCIALMEDIA_CONTRACT_DEPLOYMENT_BLOCK,
      TICKETS_FOR_SOCIALMEDIA
    )
  }
}
export class MembersCriteria extends SCHardcodedJsonUrlCriteria {
  constructor(provider: providers.Provider, snapshotBlock: number) {
    super(
      provider,
      snapshotBlock,
      'members',
      MEMBERS_CONTRACT_ADDRESS,
      MEMBERS_CONTRACT_DEPLOYMENT_BLOCK,
      TICKETS_FOR_MEMBER
    )
  }
}
