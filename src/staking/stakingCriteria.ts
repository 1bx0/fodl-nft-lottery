import { providers } from 'ethers'
import {
  FODL_ADDRESS,
  FODL_ADDRESS_ON_MATIC,
  LP_ETH_FODL_ADDRESS,
  LP_ETH_FODL_DEPLOYMENT_BLOCK,
  LP_ETH_FODL_STAKING_ADDRESS,
  LP_FODL_MATIC_ADDRESS,
  LP_FODL_MATIC_DEPLOYMENT_BLOCK,
  LP_FODL_MATIC_STAKING_ADDRESS,
  LP_USDC_FODL_ADDRESS,
  LP_USDC_FODL_DEPLOYMENT_BLOCK,
  LP_USDC_FODL_STAKING_ADDRESS,
} from '../constants'
import { Criteria } from '../criteria'
import { NamedAllocations } from '../utils'
import { LpCriteria } from './lpCriteria'
import { XFodlCriteria } from './xFodlCriteria'

export class StakingCriteria extends Criteria {
  constructor(
    ethProvider: providers.Provider,
    ethSnapshotBlock: number,
    maticProvider: providers.Provider,
    maticSnapshotBlock: number
  ) {
    super(ethSnapshotBlock)
    this.xFodl = new XFodlCriteria(ethProvider, ethSnapshotBlock)

    this.ethLp = new LpCriteria(
      ethSnapshotBlock,
      LP_ETH_FODL_ADDRESS,
      LP_ETH_FODL_DEPLOYMENT_BLOCK,
      LP_ETH_FODL_STAKING_ADDRESS,
      ethProvider,
      FODL_ADDRESS
    )

    this.usdcLp = new LpCriteria(
      ethSnapshotBlock,
      LP_USDC_FODL_ADDRESS,
      LP_USDC_FODL_DEPLOYMENT_BLOCK,
      LP_USDC_FODL_STAKING_ADDRESS,
      ethProvider,
      FODL_ADDRESS
    )

    this.maticLp = new LpCriteria(
      maticSnapshotBlock,
      LP_FODL_MATIC_ADDRESS,
      LP_FODL_MATIC_DEPLOYMENT_BLOCK,
      LP_FODL_MATIC_STAKING_ADDRESS,
      maticProvider,
      FODL_ADDRESS_ON_MATIC
    )

    this.allocations = {
      'fodl-eth-lp': this.ethLp.allocations.lp,
      'fodl-usdc-lp': this.usdcLp.allocations.lp,
      'fodl-matic-lp': this.maticLp.allocations.lp,
      xFodl: this.xFodl.allocations.xFodl,
    }
  }

  private xFodl: XFodlCriteria
  private ethLp: LpCriteria
  private usdcLp: LpCriteria
  private maticLp: LpCriteria

  public allocations: NamedAllocations = {}

  public async countTickets() {
    await Promise.all([this.ethLp, this.usdcLp, this.maticLp, this.xFodl].map((c) => c.countTickets()))
  }
}
