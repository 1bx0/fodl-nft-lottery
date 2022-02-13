import dotenv from 'dotenv'
import { BigNumber, constants, Contract, ethers, providers } from 'ethers'
import { Criteria } from '../criteria'
import {
  Allocation,
  convertAllocation,
  convertTransfers,
  getBalances,
  getHistoricHolders,
  getHistoricTransfers,
  NamedAllocations,
  sumAllocations,
  Transfer,
} from '../utils'
import {
  BLOCKS_PER_DAY,
  XFODL_ABI,
  XFODL_ADDRESS,
  XFODL_DEPLOYMENT_BLOCK,
  FODL_ADDRESS,
  FODL_ABI,
  RARI_XFODL_ADDRESS,
  RARI_XFODL_ABI,
  RARI_XFODL_DEPLOYMENT_BLOCK,
  MANTISSA,
  FODL_DECIMALS,
  SUSHI_LP_ABI,
  LP_STAKING_ABI,
  SUSHI_LP_DECIMALS,
} from './constants'

dotenv.config()

export class LPCriteria extends Criteria {
  constructor(lpAddress: string, lpDeploymentBlock: number, lpStakingAddress: string, rpcProvider: string | undefined) {
    super()
    this.provider = new ethers.providers.JsonRpcProvider(rpcProvider)
    this.lp = new Contract(lpAddress, SUSHI_LP_ABI, this.provider)
    this.lpStaking = new Contract(lpStakingAddress, LP_STAKING_ABI, this.provider)
    this.fodlToken = new Contract(FODL_ADDRESS, FODL_ABI, this.provider)
    this.lpDeploymentBlock = lpDeploymentBlock
  }

  public allocations: NamedAllocations = {}

  private provider: providers.Provider
  private lp: Contract
  private lpDeploymentBlock: number
  private lpStaking: Contract
  private fodlToken: Contract

  public async countTickets(snapshotBlock: number) {
    console.log('countTickets')
    const [lpFodlBalance, lpTotalSupply] = await Promise.all([
      this.fodlToken.callStatic.balanceOf(this.lp.address, { blockTag: snapshotBlock }),
      this.lp.callStatic.totalSupply({ blockTag: snapshotBlock }),
    ])

    const convertLpToTickets = (amount: BigNumber) =>
      amount.mul(lpFodlBalance).div(lpTotalSupply).mul(2).div(BigNumber.from(10).pow(SUSHI_LP_DECIMALS)).div(1000)

    const lpHolders = await getHistoricHolders(this.lp, this.lpDeploymentBlock, snapshotBlock)

    const [lpBalances, lpStakingBalances, lastDayLpTransfers] = await Promise.all([
      getBalances(this.lp, lpHolders, snapshotBlock),
      getBalances(this.lpStaking, lpHolders, snapshotBlock),
      getHistoricTransfers(this.lp, snapshotBlock - BLOCKS_PER_DAY, snapshotBlock),
    ])

    const balances = sumAllocations(lpBalances, lpStakingBalances)

    const minBalancesDuringLastDay = this.getMinimumBalancesDuringLastDay(balances, lastDayLpTransfers)

    this.allocations[`lp-${this.lp.address}`] = convertAllocation(minBalancesDuringLastDay, convertLpToTickets)
  }

  private getMinimumBalancesDuringLastDay(balances: Allocation, unsortedTransfers: Transfer[]): Allocation {
    let minimumBalances = { ...balances }
    const updateMinBalances = (balances: Allocation) => {
      Object.entries(balances).forEach(([address, balance]) => {
        if (minimumBalances[address].gt(balance)) minimumBalances[address] = balance
      })
    }

    const transfers = unsortedTransfers.sort((a, b) =>
      a.blockNumber != b.blockNumber ? b.blockNumber - a.blockNumber : b.logIndex - a.logIndex
    )
    for (let i = 0; i < transfers.length; ) {
      const blockNumber = transfers[i].blockNumber
      while (i < transfers.length && blockNumber == transfers[i].blockNumber) {
        const t = transfers[i]
        balances[t.from] = balances[t.from].add(t.amount)
        balances[t.to] = balances[t.to].sub(t.amount)
        i++
      }
      updateMinBalances(balances)
    }
    return minimumBalances
  }
}
