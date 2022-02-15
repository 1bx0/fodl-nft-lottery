import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import {
  BLOCKS_PER_DAY_ETHEREUM,
  ERC20_ABI,
  FODL_ADDRESS,
  FODL_ADDRESS_ON_MATIC,
  FODL_DECIMALS,
  LP_ETH_FODL_ADDRESS,
  LP_ETH_FODL_DEPLOYMENT_BLOCK,
  LP_ETH_FODL_STAKING_ADDRESS,
  LP_FODL_MATIC_ADDRESS,
  LP_FODL_MATIC_DEPLOYMENT_BLOCK,
  LP_FODL_MATIC_STAKING_ADDRESS,
  LP_STAKING_ABI,
  LP_USDC_FODL_ADDRESS,
  LP_USDC_FODL_DEPLOYMENT_BLOCK,
  LP_USDC_FODL_STAKING_ADDRESS,
} from '../constants'
import { Criteria } from '../criteria'
import {
  convertAllocation,
  getBalances,
  getHistoricHolders,
  getHistoricTransfers,
  getMinimumBalancesDuringLastDay,
  NamedAllocations,
  parseAddress,
  sumAllocations,
  Transfer,
} from '../utils'

dotenv.config()

class LpCriteria extends Criteria {
  constructor(
    snapshotBlock: number,
    lpAddress: string,
    lpDeploymentBlock: number,
    lpStakingAddress: string,
    providerUrl: string | undefined,
    fodlTokenAddress: string
  ) {
    super(snapshotBlock)
    this.provider = new ethers.providers.WebSocketProvider(providerUrl!)
    this.lp = new Contract(lpAddress, ERC20_ABI, this.provider)
    this.lpDeploymentBlock = lpDeploymentBlock
    this.lpStaking = new Contract(lpStakingAddress, LP_STAKING_ABI, this.provider)
    this.fodlToken = new Contract(fodlTokenAddress, ERC20_ABI, this.provider)
  }

  public allocations: NamedAllocations = { lp: {} }

  private provider: providers.Provider
  private lp: Contract
  private lpDeploymentBlock: number
  private lpStaking: Contract
  private fodlToken: Contract

  public async countTickets() {
    console.log(`LP ${this.lp.address} on ${(await this.provider.getNetwork()).name} criteria...`)

    const [lpFodlBalance, lpTotalSupply] = await Promise.all([
      this.fodlToken.callStatic.balanceOf(this.lp.address, { blockTag: this.snapshotBlock }),
      this.lp.callStatic.totalSupply({ blockTag: this.snapshotBlock }),
    ])

    const convertLpToTickets = (amount: BigNumber) =>
      amount.mul(lpFodlBalance).div(lpTotalSupply).mul(2).div(BigNumber.from(10).pow(FODL_DECIMALS)).div(1000)

    const lpHolders = await getHistoricHolders(this.lp, this.lpDeploymentBlock, this.snapshotBlock)

    const [lpBalances, lpStakingBalances, lastDayLpTransfers, lastDayLpStakingTransfers] = await Promise.all([
      getBalances(this.lp, lpHolders, this.snapshotBlock),
      getBalances(this.lpStaking, lpHolders, this.snapshotBlock),
      getHistoricTransfers(this.lp, this.snapshotBlock - BLOCKS_PER_DAY_ETHEREUM, this.snapshotBlock),
      this.getHistoricStakingTransfers(
        this.lpStaking,
        this.snapshotBlock - BLOCKS_PER_DAY_ETHEREUM,
        this.snapshotBlock
      ),
    ])

    const balances = sumAllocations(lpBalances, lpStakingBalances)

    const lastDayTransfers = [...lastDayLpTransfers, ...lastDayLpStakingTransfers]

    const minBalancesDuringLastDay = getMinimumBalancesDuringLastDay(balances, lastDayTransfers)

    this.allocations.lp = convertAllocation(minBalancesDuringLastDay, convertLpToTickets)
  }

  private async getHistoricStakingTransfers(token: Contract, fromBlock: number, toBlock: number): Promise<Transfer[]> {
    const staking = new ethers.Contract(token.address, LP_STAKING_ABI, token.provider)

    const tag = `${Math.random()}-stakingEvents`
    console.time(tag)
    const [stakeLogs, withdrawLogs] = await Promise.all([
      staking.queryFilter(staking.filters.Staked(), fromBlock, toBlock),
      staking.queryFilter(staking.filters.Withdrawn(), fromBlock, toBlock),
    ])
    console.timeEnd(tag)

    return [
      ...stakeLogs.map((log) => ({
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        from: ethers.constants.AddressZero,
        to: parseAddress(log.topics[1]),
        amount: BigNumber.from(log.data),
      })),
      ...withdrawLogs.map((log) => ({
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        from: parseAddress(log.topics[1]),
        to: ethers.constants.AddressZero,
        amount: BigNumber.from(log.data),
      })),
    ]
  }
}

export class EthLpCriteria extends LpCriteria {
  constructor(snapshotBlock: number) {
    super(
      snapshotBlock,
      LP_ETH_FODL_ADDRESS,
      LP_ETH_FODL_DEPLOYMENT_BLOCK,
      LP_ETH_FODL_STAKING_ADDRESS,
      process.env.ETHEREUM_RPC_PROVIDER,
      FODL_ADDRESS
    )
  }
}

export class UsdcLpCriteria extends LpCriteria {
  constructor(snapshotBlock: number) {
    super(
      snapshotBlock,
      LP_USDC_FODL_ADDRESS,
      LP_USDC_FODL_DEPLOYMENT_BLOCK,
      LP_USDC_FODL_STAKING_ADDRESS,
      process.env.ETHEREUM_RPC_PROVIDER,
      FODL_ADDRESS
    )
  }
}

export class MaticLpCriteria extends LpCriteria {
  constructor(snapshotBlock: number) {
    super(
      snapshotBlock,
      LP_FODL_MATIC_ADDRESS,
      LP_FODL_MATIC_DEPLOYMENT_BLOCK,
      LP_FODL_MATIC_STAKING_ADDRESS,
      process.env.MATIC_RPC_PROVIDER,
      FODL_ADDRESS_ON_MATIC
    )
  }
}
