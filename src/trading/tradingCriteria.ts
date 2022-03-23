import { BigNumber, Contract, ethers, providers } from 'ethers'
import { hexZeroPad } from 'ethers/lib/utils'
import {
  CHAIN_LINK_FEED_ABI,
  CLOSED_TRADE_BONUS,
  CLOSED_TRADE_MIN_CONTRIBUTION,
  ERC20_ABI,
  EVENTS_CHUNK_SIZE,
  FODL_REGISTRY_ABI,
  REGISTRY_DEPLOYMENT_BLOCK,
  REWARD_TOKENS,
  TAX_ADDRESS,
  TRANSFER_EVENT_HASH,
  USD_DECIMALS,
} from '../constants'
import { Criteria } from '../criteria'
import { NamedAllocations, parseAddress } from '../utils'

export type Chain = {
  provider: providers.Provider
  fodlRegistryAddress: string
  priceFeeds: { [symbol: string]: string }
}

/*
 * This rule allocates tickets based on USD contributed to the tax wallet. 1 USD = 1 ticket.
 * A bonus of 50 tickets is given for every trade closed with more than 5 USD contribution.
 * Any withdrawal of position value is considered a closed trade as the user is essentially
 * splitting his position into a closed one and one that remains open.
 */
export class TradingCriteria extends Criteria {
  constructor(private chain: Chain, snapshotBlock: number) {
    super(snapshotBlock)
    this.registry = new Contract(this.chain.fodlRegistryAddress, FODL_REGISTRY_ABI, this.chain.provider)
  }

  public allocations: NamedAllocations = {}
  public networkName: string = ''

  private registry: Contract

  private ownersCache: { [ownerAtBlock: string]: string } = {}
  private pricesCache: { [priceAtBlock: string]: BigNumber } = {}
  private decimalsCache: { [tokenAddress: string]: BigNumber } = {}

  private clearCaches() {
    this.ownersCache = {}
    this.pricesCache = {}
  }

  private async getOwner(from: string, blockNumber: number) {
    const key = `${blockNumber}|${from.toLowerCase()}`
    if (!this.ownersCache[key])
      this.ownersCache[key] = (
        await this.registry.callStatic.accountOwner(from, { blockTag: blockNumber })
      ).toLowerCase()

    return this.ownersCache[key]
  }

  private async getPrice(token: string, blockNumber: number) {
    const key = `${blockNumber}|${token.toLowerCase()}`
    if (!this.pricesCache[key]) {
      const sym = await new Contract(token, ERC20_ABI, this.chain.provider).callStatic.symbol()
      if (!this.chain.priceFeeds[sym]) throw new Error('Token symbol not in chainlink pricefeed map!')
      const feed = new Contract(this.chain.priceFeeds[sym], CHAIN_LINK_FEED_ABI, this.chain.provider)
      this.pricesCache[key] = await feed.callStatic.latestAnswer({ blockTag: blockNumber })
    }

    return this.pricesCache[key]
  }

  private async getDecimals(token: string) {
    const key = token.toLowerCase()
    if (!this.decimalsCache[key])
      this.decimalsCache[key] = await new Contract(token, ERC20_ABI, this.chain.provider).callStatic.decimals()

    return this.decimalsCache[key]
  }

  private tokenNotReward(token: string) {
    return REWARD_TOKENS.find((address) => address.toLowerCase() == token.toLowerCase()) == undefined
  }

  public async countTickets() {
    this.networkName = (await this.chain.provider.getNetwork()).name
    this.allocations[`${this.networkName}-closedTrade`] = {}
    this.allocations[`${this.networkName}-trading`] = {}
    console.log(`${this.networkName} Trading Criteria...`)
    const tag = `${this.networkName} tax-contributions`
    console.time(tag)
    for (let fromBlock = REGISTRY_DEPLOYMENT_BLOCK; fromBlock <= this.snapshotBlock; fromBlock += EVENTS_CHUNK_SIZE) {
      this.clearCaches()
      await this.processLogs(fromBlock, Math.min(fromBlock + EVENTS_CHUNK_SIZE, this.snapshotBlock))
      console.timeLog(tag)
    }
  }

  private async processLogs(fromBlock: number, toBlock: number) {
    const logs = await this.chain.provider.getLogs({
      fromBlock,
      toBlock,
      topics: [TRANSFER_EVENT_HASH, null, hexZeroPad(TAX_ADDRESS, 32)],
    })
    const contributions = (await Promise.all(logs.map((log) => this.processTransfer(log)))).filter((e) => e != null)
    contributions.forEach((contribution) => {
      if (contribution == null) return
      this.allocations[`${this.networkName}-trading`][contribution.owner] = contribution.dollarsContributed.add(
        this.allocations[`${this.networkName}-trading`][contribution.owner] || BigNumber.from(0)
      )

      this.allocations[`${this.networkName}-closedTrade`][contribution.owner] = contribution.closedTradeBonus.add(
        this.allocations[`${this.networkName}-closedTrade`][contribution.owner] || BigNumber.from(0)
      )
    })
  }

  private async processTransfer(log: ethers.providers.Log) {
    try {
      const blockNumber = log.blockNumber
      const token = log.address
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
      console.error(this.networkName, 'The following log should be ignored due to:', log, e)
      return null
    }
  }
}
