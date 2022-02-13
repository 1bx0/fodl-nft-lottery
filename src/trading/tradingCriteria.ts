import dotenv from 'dotenv'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import { hexZeroPad } from 'ethers/lib/utils'
import {
  AAVE_ADDRESS,
  BTC_ADDRESS,
  CHAIN_LINK_FEED_ABI,
  CHAIN_LINK_FEED_ADDRESS,
  CLOSED_TRADE_BONUS,
  CLOSED_TRADE_MIN_CONTRIBUTION,
  COMP_ADDRESS,
  DEPLOY_BLOCK_NUMBER,
  ERC20_ABI,
  ETH_ADDRESS,
  EVENTS_CHUNK_SIZE,
  FODL_REGISTRY_ABI,
  FODL_REGISTRY_ADDRESS,
  STK_AAVE_ADDRESS,
  TAX_ADDRESS,
  TRANSFER_EVENT_HASH,
  USD_ADDRESS,
  USD_DECIMALS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
} from './constants'
import { Criteria } from '../criteria'
import { NamedAllocations, parseAddress } from '../utils'

dotenv.config()

export class TradingCriteria extends Criteria {
  constructor() {
    super()
    this.provider = new providers.JsonRpcProvider(process.env.ETHEREUM_RPC_PROVIDER)
    this.priceFeed = new ethers.Contract(CHAIN_LINK_FEED_ADDRESS, CHAIN_LINK_FEED_ABI, this.provider)
    this.registry = new ethers.Contract(FODL_REGISTRY_ADDRESS, FODL_REGISTRY_ABI, this.provider)
  }

  public allocations: NamedAllocations = { trading: {}, closedTrade: {} }

  private priceFeed: Contract
  private registry: Contract
  private provider: providers.Provider

  private ownersCache: { [ownerAtBlock: string]: string } = {}
  private pricesCache: { [priceAtBlock: string]: BigNumber } = {}
  private decimalsCache: { [tokenAddress: string]: BigNumber } = {}

  private clearCaches() {
    this.ownersCache = {}
    this.pricesCache = {}
  }

  private async getOwner(from: string, blockNumber: number) {
    const key = `${blockNumber}|${from}`
    if (!this.ownersCache[key])
      this.ownersCache[key] = await this.registry.callStatic.accountOwner(from, { blockTag: blockNumber })

    return this.ownersCache[key]
  }

  private async getPrice(token: string, blockNumber: number) {
    const key = `${blockNumber}|${token}`
    if (!this.pricesCache[key])
      this.pricesCache[key] = await this.priceFeed.callStatic.latestAnswer(token, USD_ADDRESS, {
        blockTag: blockNumber,
      })

    return this.pricesCache[key]
  }

  private async getDecimals(token: string) {
    const key = token
    if (!this.decimalsCache[key])
      this.decimalsCache[key] = await new Contract(token, ERC20_ABI, this.provider).callStatic.decimals()

    return this.decimalsCache[key]
  }

  private getToken(address: string) {
    if (address.toLowerCase() == WETH_ADDRESS.toLowerCase()) return ETH_ADDRESS
    if (address.toLowerCase() == WBTC_ADDRESS.toLowerCase()) return BTC_ADDRESS
    if (address.toLowerCase() == STK_AAVE_ADDRESS.toLowerCase()) return AAVE_ADDRESS
    return address
  }

  private tokenNotReward(token: string) {
    return token.toLowerCase() != COMP_ADDRESS.toLowerCase() && token.toLowerCase() != AAVE_ADDRESS.toLowerCase()
  }

  public async countTickets(snapshotBlock: number) {
    console.log('Getting all transfers to tax wallet...')

    console.log(
      `Splitting in ${Math.ceil(
        (snapshotBlock - DEPLOY_BLOCK_NUMBER) / EVENTS_CHUNK_SIZE
      )} chunks of size ${EVENTS_CHUNK_SIZE}}`
    )

    const tag = 'count trading tickets for each dollar contributed to tax wallet'
    console.time(tag)
    for (let fromBlock = DEPLOY_BLOCK_NUMBER; fromBlock <= snapshotBlock; fromBlock += EVENTS_CHUNK_SIZE) {
      this.clearCaches()
      await this.processLogs(fromBlock, Math.min(fromBlock + EVENTS_CHUNK_SIZE, snapshotBlock))
    }
    console.timeEnd(tag)
  }

  private async processLogs(fromBlock: number, toBlock: number) {
    const tag = `chunk ${Math.ceil((fromBlock - DEPLOY_BLOCK_NUMBER) / EVENTS_CHUNK_SIZE)}`
    console.log(`${tag} from block: ${fromBlock} to block: ${toBlock}`)

    console.time(tag)
    const logs = await this.provider.getLogs({
      fromBlock,
      toBlock,
      topics: [TRANSFER_EVENT_HASH, null, hexZeroPad(TAX_ADDRESS, 32)],
    })
    console.timeLog(tag, `Logs to process: ${logs.length}`)

    const contributions = (await Promise.all(logs.map((log) => this.processTransfer(log)))).filter((e) => e != null)
    contributions.forEach((contribution) => {
      if (contribution == null) return
      this.allocations.trading[contribution.owner] = contribution.dollarsContributed.add(
        this.allocations.trading[contribution.owner] || BigNumber.from(0)
      )

      this.allocations.closedTrade[contribution.owner] = contribution.closedTradeBonus.add(
        this.allocations.closedTrade[contribution.owner] || BigNumber.from(0)
      )
    })
    console.timeEnd(tag)
  }

  private async processTransfer(log: ethers.providers.Log) {
    try {
      const blockNumber = log.blockNumber
      const token = this.getToken(log.address)
      const from = parseAddress(log.topics[1])
      const tokenAmount = BigNumber.from(log.data)

      const [owner, price, decimals] = await Promise.all([
        this.getOwner(from, blockNumber),
        this.getPrice(token, blockNumber),
        this.getDecimals(log.address),
      ])
      const dollarsContributed = tokenAmount
        .mul(price)
        .div(BigNumber.from(10).pow(USD_DECIMALS))
        .div(BigNumber.from(10).pow(decimals))

      const closedTradeBonus = BigNumber.from(
        this.tokenNotReward(token) && dollarsContributed.gte(CLOSED_TRADE_MIN_CONTRIBUTION) ? CLOSED_TRADE_BONUS : 0
      )

      return {
        dollarsContributed,
        closedTradeBonus,
        owner,
      }
    } catch (e) {
      console.error('Error for log:', log, e)
      return null
    }
  }
}
