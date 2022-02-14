import { BigNumber, Contract, ethers } from 'ethers'
import { ERC20_ABI, EVENTS_CHUNK_SIZE, TIMESTAMP_SEARCH_MARGIN } from './constants'

export type Allocation = { [key: string]: BigNumber }
export type NamedAllocations = { [reason: string]: Allocation }
export type Transfer = {
  blockNumber: number
  logIndex: number
  from: string
  to: string
  amount: BigNumber
}

export const convertAllocation = (input: Allocation, applyFn: (value: BigNumber) => BigNumber) =>
  Object.fromEntries(Object.entries(input).map(([key, val]) => [key, applyFn(val)]))

export const convertTransfers = async (ts: Transfer[], applyFn: (transfer: Transfer) => Promise<BigNumber>) =>
  await Promise.all(ts.map(async (t) => ({ ...t, amountOld: t.amount, amount: await applyFn(t) })))

export const sumAllocations = (...allocations: Allocation[]): Allocation => {
  const result: Allocation = {}
  allocations.forEach((a) =>
    Object.entries(a).forEach(([owner, value]) => {
      result[owner.toLowerCase()] = value.add(result[owner.toLowerCase()] || BigNumber.from(0))
    })
  )
  return result
}

export const filterZeroes = (allocation: Allocation): Allocation =>
  Object.fromEntries(Object.entries(allocation).filter(([_, value]) => !value.isZero()))

export const exclude = (allocation: Allocation, list: string[]) => {
  list.forEach((element) => (allocation[element.toLowerCase()] = BigNumber.from(0)))
  return allocation
}

export const parseAddress = (paddedAddress: string) => ethers.utils.hexDataSlice(paddedAddress, 12).toLowerCase()

export const getHistoricTransfers = async (
  token: Contract,
  fromBlock: number,
  toBlock: number
): Promise<Transfer[]> => {
  const erc20 = new ethers.Contract(token.address, ERC20_ABI, token.provider)

  const tag = `${Math.random()}-transfers`
  console.time(tag)
  const logs = await erc20.queryFilter(erc20.filters.Transfer(), fromBlock, toBlock)
  console.timeEnd(tag)

  return logs.map((log) => ({
    blockNumber: log.blockNumber,
    logIndex: log.logIndex,
    from: parseAddress(log.topics[1]),
    to: parseAddress(log.topics[2]),
    amount: BigNumber.from(log.data),
  }))
}

export const getHistoricHolders = async (token: Contract, fromBlock: number, toBlock: number): Promise<Set<string>> => {
  const holders: Set<string> = new Set<string>()
  const erc20 = new ethers.Contract(token.address, ERC20_ABI, token.provider)

  const tag = `${Math.random()}-holders`
  console.time(tag)
  for (let i = fromBlock; i <= toBlock; i += EVENTS_CHUNK_SIZE) {
    const logs = await erc20.queryFilter(erc20.filters.Transfer(), i, Math.min(i + EVENTS_CHUNK_SIZE, toBlock))
    logs.forEach((log) => {
      holders.add(parseAddress(log.topics[2]))
    })
    console.timeLog(tag)
  }

  return holders
}

export const getBalances = async (erc20: Contract, addresses: Set<string>, atBlock: number): Promise<Allocation> => {
  const addrs = [...addresses]
  const tag = `${Math.random()}-holders`
  console.time(tag)
  const balances = await Promise.all(addrs.map((address) => erc20.callStatic.balanceOf(address, { blockTag: atBlock })))
  console.timeEnd(tag)
  return Object.fromEntries(addrs.map((a, i) => [a, balances[i]]))
}

export const getMinimumBalancesDuringLastDay = (balances: Allocation, unsortedTransfers: Transfer[]): Allocation => {
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

// returns blocknumber of first block after given timestamp
export const getBlockAfterTimestamp = async (
  timestamp: number,
  provider: ethers.providers.StaticJsonRpcProvider
): Promise<number> => {
  let upperBlockNum = await provider.getBlockNumber()
  let searchResult = Math.floor(upperBlockNum / 2)
  let lowerBlockNum = 0
  const timeNow = (await provider.getBlock(upperBlockNum)).timestamp

  if (timestamp > timeNow) {
    throw new Error('cannot get block number for timestamp in future')
  }
  if (timestamp < TIMESTAMP_SEARCH_MARGIN) {
    searchResult = 0
  } else if (timeNow - timestamp < TIMESTAMP_SEARCH_MARGIN) {
    searchResult = upperBlockNum
  }

  let searchResultTimeStamp = (await provider.getBlock(searchResult)).timestamp
  while (Math.abs(searchResultTimeStamp - timestamp) > TIMESTAMP_SEARCH_MARGIN) {
    if (timestamp > searchResultTimeStamp) {
      lowerBlockNum = searchResult
    } else if (timestamp < searchResultTimeStamp) {
      upperBlockNum = searchResult
    }
    searchResult = Math.floor(lowerBlockNum + (upperBlockNum - lowerBlockNum) / 2)
    searchResultTimeStamp = (await provider.getBlock(searchResult)).timestamp
  }

  if (searchResultTimeStamp <= timestamp) {
    while (searchResultTimeStamp <= timestamp) {
      searchResult++
      searchResultTimeStamp = (await provider.getBlock(searchResult)).timestamp
    }
    return searchResult
  } else {
    while (searchResultTimeStamp > timestamp) {
      searchResult--
      searchResultTimeStamp = (await provider.getBlock(searchResult)).timestamp
    }
    return searchResult + 1
  }
}
