import { BigNumber, Contract, ethers, EventFilter } from 'ethers'
import { ERC20_ABI, EVENTS_CHUNK_SIZE } from './trading/constants'

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

export const convertTransfers = (ts: Transfer[], applyFn: (value: BigNumber) => BigNumber) =>
  ts.map((t) => ({ ...t, amount: applyFn(t.amount) }))

export const sumAllocations = (...allocations: Allocation[]): Allocation => {
  const result: Allocation = {}
  allocations.forEach((a) =>
    Object.entries(a).forEach(([owner, value]) => {
      result[owner] = value.add(result[owner] || BigNumber.from(0))
    })
  )
  return result
}

export const filterZeroes = (allocation: Allocation): Allocation => {
  return Object.fromEntries(Object.entries(allocation).filter(([_, value]) => !value.isZero()))
}

export const parseAddress = (paddedAddress: string) => ethers.utils.hexDataSlice(paddedAddress, 12)

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
