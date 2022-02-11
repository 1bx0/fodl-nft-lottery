import { BigNumber } from 'ethers'

export type Allocation = { [key: string]: BigNumber }
export type NamedAllocations = { [reason: string]: Allocation }

export const sumAllocations = (...allocations: Allocation[]) => {
  const result: Allocation = {}
  allocations.forEach((a) =>
    Object.entries(a).forEach(([owner, value]) => {
      result[owner] = value.add(result[owner] || BigNumber.from(0))
    })
  )
  return result
}

export const filterZeroes = (allocation: Allocation) => {
  return Object.fromEntries(Object.entries(allocation).filter(([_, value]) => !value.isZero()))
}
