import dotenv from 'dotenv'
import { BigNumber, Contract, ethers } from 'ethers'
import {
  BOATLIFTERS_CONTRACT_ADDRESS,
  BOATLIFTERS_CONTRACT_DEPLOYMENT_BLOCK,
  LIST_CONTRACT_ABI,
  SOCIALMEDIA_CONTRACT_ADDRESS,
  SOCIALMEDIA_CONTRACT_DEPLOYMENT_BLOCK,
  TICKETS_FOR_BOATLIFTER,
  TICKETS_FOR_SOCIALMEDIA,
} from '../constants'
import { Criteria } from '../criteria'
import { NamedAllocations } from '../utils'

dotenv.config()

abstract class SCHardcodedListCriteria extends Criteria {
  constructor(
    snapshotBlock: number,
    allocationName: string,
    address: string,
    deploymentBlock: number,
    tickets: number
  ) {
    super(snapshotBlock)
    this.allocationName = allocationName
    const provider = new ethers.providers.WebSocketProvider(process.env.ETHEREUM_RPC_PROVIDER || '')
    this.sc = new Contract(address, LIST_CONTRACT_ABI, provider)
    this.deploymentBlock = deploymentBlock
    this.tickets = tickets
  }

  private allocationName: string
  private sc: Contract
  private deploymentBlock: number
  private tickets: number

  public allocations: NamedAllocations = {}

  public async countTickets() {
    const list: string[] = await this.sc.callStatic.getAll({
      blockTag: this.snapshotBlock > this.deploymentBlock ? this.snapshotBlock : this.deploymentBlock + 1,
    })
    this.allocations[this.allocationName] = Object.fromEntries(
      list.map((a) => [a.toLowerCase(), BigNumber.from(this.tickets)])
    )
  }
}

export class BoatliftersCriteria extends SCHardcodedListCriteria {
  constructor(snapshotBlock: number) {
    super(
      snapshotBlock,
      'boatlifters',
      BOATLIFTERS_CONTRACT_ADDRESS,
      BOATLIFTERS_CONTRACT_DEPLOYMENT_BLOCK,
      TICKETS_FOR_BOATLIFTER
    )
  }
}

export class SocialMediaCriteria extends SCHardcodedListCriteria {
  constructor(snapshotBlock: number) {
    super(
      snapshotBlock,
      'socialmedia',
      SOCIALMEDIA_CONTRACT_ADDRESS,
      SOCIALMEDIA_CONTRACT_DEPLOYMENT_BLOCK,
      TICKETS_FOR_SOCIALMEDIA
    )
  }
}
