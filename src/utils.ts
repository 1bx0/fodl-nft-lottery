import { Block } from '@ethersproject/abstract-provider'
import { BigNumber, Contract, ethers, providers } from 'ethers'
import { ERC20_ABI, EVENTS_CHUNK_SIZE } from './constants'

export type Allocation = { [key: string]: BigNumber }
export type AllocationWithBreakdown = { [key: string]: Allocation }
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

export const filterAllocation = (allocation: Allocation, filter: (k: string, v: BigNumber) => boolean): Allocation =>
  Object.fromEntries(Object.entries(allocation).filter(([k, v]) => filter(k, v)))

export const parseAddress = (paddedAddress: string) => ethers.utils.hexDataSlice(paddedAddress, 12).toLowerCase()

export const getHistoricTransfers = async (
  token: Contract,
  fromBlock: number,
  toBlock: number
): Promise<Transfer[]> => {
  const erc20 = new ethers.Contract(token.address, ERC20_ABI, token.provider)

  const tag = `transfers-${token.address}`
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

  const tag = `holders-${token.address}`
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

export const getBalances = async (token: Contract, addresses: Set<string>, atBlock: number): Promise<Allocation> => {
  const addrs = [...addresses]
  const erc20 = new ethers.Contract(token.address, ERC20_ABI, token.provider)

  const tag = `balances-${erc20.address}`
  console.time(tag)
  const balances = await Promise.all(addrs.map((address) => erc20.balanceOf(address, { blockTag: atBlock })))
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
      if (!t.amount.isZero()) {
        balances[t.from] = balances[t.from].add(t.amount)
        balances[t.to] = balances[t.to].sub(t.amount)
      }
      i++
    }
    updateMinBalances(balances)
  }
  return minimumBalances
}

export const computeAllocationBreakdown = (totals: Allocation, as: NamedAllocations): AllocationWithBreakdown =>
  Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [
      k,
      { total: v, ...Object.fromEntries(Object.entries(as).map(([n, a]) => [n, a[k] || BigNumber.from(0)])) },
    ])
  )

export const getBlockBefore = async (target: number, provider: providers.Provider) => {
  const averageBlockTime = (await provider.getNetwork()).name == 'matic' ? 2 : 15

  const getBlockDiff = async (block: Block, diff: number) => {
    // console.log(new Date(block.timestamp * 1000), block.number, diff)
    return await provider.getBlock(block.number - diff)
  }

  let block = await provider.getBlock('latest')
  let minDiff = Number.MAX_VALUE
  while (Math.abs(target - block.timestamp) < minDiff) {
    minDiff = Math.abs(target - block.timestamp)
    let diff = (block.timestamp - target) / averageBlockTime
    diff = diff > 0 ? Math.ceil(diff) : Math.floor(diff)
    block = await getBlockDiff(block, diff)
  }
  while (target < block.timestamp) block = await getBlockDiff(block, 1)
  while (target > block.timestamp) block = await getBlockDiff(block, -1)

  // console.log('found', new Date(block.timestamp * 1000), block.number)
  return block.number
}

// Date from timestamp or last midnight
export const getTimestampOrMidnight = (timestamp: string | undefined) =>
  dateToSeconds(timestamp || new Date().toDateString())

export const dateToSeconds = (dateTime: string) => Math.floor(new Date(dateTime).getTime() / 1000)
