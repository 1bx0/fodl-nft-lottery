import { BigNumber, Contract, ethers, EventFilter } from 'ethers'
import { LP_STAKING_ABI } from './staking/constants'
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

export const getHistoricStakingTransfers = async (
  token: Contract,
  fromBlock: number,
  toBlock: number
): Promise<Transfer[]> => {
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
