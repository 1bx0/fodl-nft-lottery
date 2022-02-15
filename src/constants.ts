import dotenv from 'dotenv'
import { BigNumber, constants } from 'ethers'

dotenv.config()

export const COMP_ADDRESS = '0xc00e94Cb662C3520282E6f5717214004A7f26888'
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const STK_AAVE_ADDRESS = '0x4da27a545c0c5B758a6BA100e3a049001de870f5'
export const AAVE_ADDRESS = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'
export const WBTC_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
export const BTC_ADDRESS = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
export const USD_ADDRESS = '0x0000000000000000000000000000000000000348'

export const TAX_ADDRESS = '0xff6062aac9a6367ce2f02c826c544a130babcf32'
export const CHAIN_LINK_FEED_ADDRESS = '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'
export const CHAIN_LINK_FEED_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'accessController', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'AccessControllerSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'asset', type: 'address' },
      { indexed: true, internalType: 'address', name: 'denomination', type: 'address' },
      { indexed: true, internalType: 'address', name: 'latestAggregator', type: 'address' },
      { indexed: false, internalType: 'address', name: 'previousAggregator', type: 'address' },
      { indexed: false, internalType: 'uint16', name: 'nextPhaseId', type: 'uint16' },
      { indexed: false, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'FeedConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'asset', type: 'address' },
      { indexed: true, internalType: 'address', name: 'denomination', type: 'address' },
      { indexed: true, internalType: 'address', name: 'proposedAggregator', type: 'address' },
      { indexed: false, internalType: 'address', name: 'currentAggregator', type: 'address' },
      { indexed: false, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'FeedProposed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  { inputs: [], name: 'acceptOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'address', name: 'aggregator', type: 'address' },
    ],
    name: 'confirmFeed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'description',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAccessController',
    outputs: [{ internalType: 'contract AccessControllerInterface', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint256', name: 'roundId', type: 'uint256' },
    ],
    name: 'getAnswer',
    outputs: [{ internalType: 'int256', name: 'answer', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'getCurrentPhaseId',
    outputs: [{ internalType: 'uint16', name: 'currentPhaseId', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'getFeed',
    outputs: [{ internalType: 'contract AggregatorV2V3Interface', name: 'aggregator', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
    ],
    name: 'getNextRoundId',
    outputs: [{ internalType: 'uint80', name: 'nextRoundId', type: 'uint80' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint16', name: 'phaseId', type: 'uint16' },
    ],
    name: 'getPhase',
    outputs: [
      {
        components: [
          { internalType: 'uint16', name: 'phaseId', type: 'uint16' },
          { internalType: 'uint80', name: 'startingAggregatorRoundId', type: 'uint80' },
          { internalType: 'uint80', name: 'endingAggregatorRoundId', type: 'uint80' },
        ],
        internalType: 'struct FeedRegistryInterface.Phase',
        name: 'phase',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint16', name: 'phaseId', type: 'uint16' },
    ],
    name: 'getPhaseFeed',
    outputs: [{ internalType: 'contract AggregatorV2V3Interface', name: 'aggregator', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint16', name: 'phaseId', type: 'uint16' },
    ],
    name: 'getPhaseRange',
    outputs: [
      { internalType: 'uint80', name: 'startingRoundId', type: 'uint80' },
      { internalType: 'uint80', name: 'endingRoundId', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
    ],
    name: 'getPreviousRoundId',
    outputs: [{ internalType: 'uint80', name: 'previousRoundId', type: 'uint80' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'getProposedFeed',
    outputs: [{ internalType: 'contract AggregatorV2V3Interface', name: 'proposedAggregator', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint80', name: '_roundId', type: 'uint80' },
    ],
    name: 'getRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
    ],
    name: 'getRoundFeed',
    outputs: [{ internalType: 'contract AggregatorV2V3Interface', name: 'aggregator', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint256', name: 'roundId', type: 'uint256' },
    ],
    name: 'getTimestamp',
    outputs: [{ internalType: 'uint256', name: 'timestamp', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'aggregator', type: 'address' }],
    name: 'isFeedEnabled',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: 'answer', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'latestRound',
    outputs: [{ internalType: 'uint256', name: 'roundId', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'latestTimestamp',
    outputs: [{ internalType: 'uint256', name: 'timestamp', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'address', name: 'aggregator', type: 'address' },
    ],
    name: 'proposeFeed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
    ],
    name: 'proposedGetRoundData',
    outputs: [
      { internalType: 'uint80', name: 'id', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'proposedLatestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'id', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract AccessControllerInterface', name: '_accessController', type: 'address' }],
    name: 'setAccessController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'typeAndVersion',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'base', type: 'address' },
      { internalType: 'address', name: 'quote', type: 'address' },
    ],
    name: 'version',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export const FODL_REGISTRY_ADDRESS = '0xec6b351778aaa2349a8726b4837e05232ef20d03'
export const REGISTRY_DEPLOYMENT_BLOCK = 13373735
export const FODL_REGISTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes1', name: 'flag', type: 'bytes1' },
      { indexed: false, internalType: 'address', name: 'adapter', type: 'address' },
    ],
    name: 'ExchangerAdapterLinkUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'implementation', type: 'address' },
      { indexed: false, internalType: 'bytes4[]', name: 'signatures', type: 'bytes4[]' },
    ],
    name: 'ImplementationAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'bytes4[]', name: 'signatures', type: 'bytes4[]' }],
    name: 'ImplementationRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'platform', type: 'address' },
      { indexed: false, internalType: 'address', name: 'adapter', type: 'address' },
    ],
    name: 'PlatformAdapterLinkUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'platform', type: 'address' },
      { indexed: false, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'address', name: 'syntheticToken', type: 'address' },
    ],
    name: 'TokenOnPlatformUpdated',
    type: 'event',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'accountOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'platforms', type: 'address[]' },
      { internalType: 'address', name: 'adapter', type: 'address' },
    ],
    name: 'addBatchPlatformsWithAdapter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'platform', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'synthToken', type: 'address' },
    ],
    name: 'addCTokenOnPlatform',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes1', name: 'flag', type: 'bytes1' },
      { internalType: 'address', name: 'adapter', type: 'address' },
    ],
    name: 'addExchangerWithAdapter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_implementation', type: 'address' },
      { internalType: 'bytes4[]', name: '_sigs', type: 'bytes4[]' },
    ],
    name: 'addImplementation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'platform', type: 'address' },
      { internalType: 'address', name: 'adapter', type: 'address' },
    ],
    name: 'addPlatformWithAdapter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes1', name: 'flag', type: 'bytes1' },
      { internalType: 'address', name: 'newAdapter', type: 'address' },
    ],
    name: 'changeExchangerAdapter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'platform', type: 'address' },
      { internalType: 'address', name: 'newAdapter', type: 'address' },
    ],
    name: 'changePlatformAdapter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createAccount',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fodlNFT',
    outputs: [{ internalType: 'contract FodlNFT', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'platform', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'getCToken',
    outputs: [{ internalType: 'address', name: 'cToken', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes1', name: 'flag', type: 'bytes1' }],
    name: 'getExchangerAdapter',
    outputs: [{ internalType: 'address', name: 'adapter', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: '_sig', type: 'bytes4' }],
    name: 'getImplementation',
    outputs: [{ internalType: 'address', name: 'implementation', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'platform', type: 'address' }],
    name: 'getPlatformAdapter',
    outputs: [{ internalType: 'address', name: 'adapter', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'fodlNFT_', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'platform', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'removeCTokenFromPlatform',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes1', name: 'flag', type: 'bytes1' }],
    name: 'removeExchanger',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4[]', name: 'sigs', type: 'bytes4[]' }],
    name: 'removeImplementation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'platform', type: 'address' }],
    name: 'removePlatform',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [{ internalType: 'address', name: 'fodlNFTV2_', type: 'address' }],
    name: 'setNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'pure',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
]
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
]

export const LP_FODL_MATIC_ADDRESS = '0x2Fc4DFCEe8C331D54341f5668a6d9BCdd86F8e2f'
export const LP_FODL_MATIC_DEPLOYMENT_BLOCK = 22290007
export const LP_FODL_MATIC_STAKING_ADDRESS = '0x75ca5c33ed96222dde8488c385e823852161d44a'

export const LP_USDC_FODL_ADDRESS = '0xA5c475167f03B1556C054E0dA78192cd2779087F'
export const LP_USDC_FODL_DEPLOYMENT_BLOCK = 13416786
export const LP_ETH_FODL_ADDRESS = '0xCE7E98d4dA6EBdA6Af474eA618C6b175729cD366'
export const LP_ETH_FODL_DEPLOYMENT_BLOCK = 13416786
export const LP_USDC_FODL_STAKING_ADDRESS = '0xF958a023d5B1e28c32373547bDdE001cAD17E9B4'
export const LP_ETH_FODL_STAKING_ADDRESS = '0xA7453338ccc29E4541e6C6B0546A99Cc6b9EB09a'
export const LP_STAKING_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_rewardsToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_stakingToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_rewardsDuration',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Recovered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'RewardAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'RewardPaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newDuration',
        type: 'uint256',
      },
    ],
    name: 'RewardsDurationUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Staked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'earned',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRewardForDuration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastTimeRewardApplicable',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastUpdateTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'notifyRewardAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauseStaking',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'periodFinish',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'recoverERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardPerToken',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardPerTokenStored',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewards',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardsDuration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardsToken',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_rewardsDuration',
        type: 'uint256',
      },
    ],
    name: 'setRewardsDuration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stakingToken',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpauseStaking',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userRewardPerTokenPaid',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const XFODL_DEPLOYMENT_BLOCK = 13684767
export const XFODL_ADDRESS = '0x7e05540A61b531793742fde0514e6c136b5fbAfE'
export const RARI_XFODL_DEPLOYMENT_BLOCK = 13678684
export const RARI_XFODL_ADDRESS = '0xF0A6b4F7F26F6188d821CFBc69A31fb0bbB9702F'
export const RARI_XFODL_ABI = [
  { inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'cashPrior', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'interestAccumulated', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'borrowIndex', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalBorrows', type: 'uint256' },
    ],
    name: 'AccrueInterest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'spender', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'borrowAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'accountBorrows', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalBorrows', type: 'uint256' },
    ],
    name: 'Borrow',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'error', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'info', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'detail', type: 'uint256' },
    ],
    name: 'Failure',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'liquidator', type: 'address' },
      { indexed: false, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'repayAmount', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'cTokenCollateral', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'seizeTokens', type: 'uint256' },
    ],
    name: 'LiquidateBorrow',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'minter', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'mintAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'mintTokens', type: 'uint256' },
    ],
    name: 'Mint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'oldAdminFeeMantissa', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newAdminFeeMantissa', type: 'uint256' },
    ],
    name: 'NewAdminFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'contract ComptrollerInterface', name: 'oldComptroller', type: 'address' },
      { indexed: false, internalType: 'contract ComptrollerInterface', name: 'newComptroller', type: 'address' },
    ],
    name: 'NewComptroller',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'oldFuseFeeMantissa', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newFuseFeeMantissa', type: 'uint256' },
    ],
    name: 'NewFuseFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'oldImplementation', type: 'address' },
      { indexed: false, internalType: 'address', name: 'newImplementation', type: 'address' },
    ],
    name: 'NewImplementation',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'contract InterestRateModel', name: 'oldInterestRateModel', type: 'address' },
      { indexed: false, internalType: 'contract InterestRateModel', name: 'newInterestRateModel', type: 'address' },
    ],
    name: 'NewMarketInterestRateModel',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'oldReserveFactorMantissa', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newReserveFactorMantissa', type: 'uint256' },
    ],
    name: 'NewReserveFactor',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'redeemer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'redeemAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'redeemTokens', type: 'uint256' },
    ],
    name: 'Redeem',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'payer', type: 'address' },
      { indexed: false, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'repayAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'accountBorrows', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalBorrows', type: 'uint256' },
    ],
    name: 'RepayBorrow',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'benefactor', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'addAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newTotalReserves', type: 'uint256' },
    ],
    name: 'ReservesAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'admin', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'reduceAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newTotalReserves', type: 'uint256' },
    ],
    name: 'ReservesReduced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    constant: false,
    inputs: [{ internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: '_becomeImplementation',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'address', name: 'compLikeDelegatee', type: 'address' }],
    name: '_delegateCompLikeTo',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: '_prepare',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'reduceAmount', type: 'uint256' }],
    name: '_reduceReserves',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'newAdminFeeMantissa', type: 'uint256' }],
    name: '_setAdminFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'implementation_', type: 'address' },
      { internalType: 'bool', name: 'allowResign', type: 'bool' },
      { internalType: 'bytes', name: 'becomeImplementationData', type: 'bytes' },
    ],
    name: '_setImplementationSafe',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'contract InterestRateModel', name: 'newInterestRateModel', type: 'address' }],
    name: '_setInterestRateModel',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_symbol', type: 'string' },
    ],
    name: '_setNameAndSymbol',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'newReserveFactorMantissa', type: 'uint256' }],
    name: '_setReserveFactor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'withdrawAmount', type: 'uint256' }],
    name: '_withdrawAdminFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'withdrawAmount', type: 'uint256' }],
    name: '_withdrawFuseFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'accrualBlockNumber',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'accrueInterest',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'adminFeeMantissa',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOfUnderlying',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'borrowAmount', type: 'uint256' }],
    name: 'borrow',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'borrowBalanceCurrent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'borrowBalanceStored',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'borrowIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'borrowRatePerBlock',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'comptroller',
    outputs: [{ internalType: 'contract ComptrollerInterface', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'exchangeRateCurrent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'exchangeRateStored',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'fuseFeeMantissa',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'getAccountSnapshot',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getCash',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'implementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'contract ComptrollerInterface', name: 'comptroller_', type: 'address' },
      { internalType: 'contract InterestRateModel', name: 'interestRateModel_', type: 'address' },
      { internalType: 'uint256', name: 'initialExchangeRateMantissa_', type: 'uint256' },
      { internalType: 'string', name: 'name_', type: 'string' },
      { internalType: 'string', name: 'symbol_', type: 'string' },
      { internalType: 'uint8', name: 'decimals_', type: 'uint8' },
      { internalType: 'uint256', name: 'reserveFactorMantissa_', type: 'uint256' },
      { internalType: 'uint256', name: 'adminFeeMantissa_', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'underlying_', type: 'address' },
      { internalType: 'contract ComptrollerInterface', name: 'comptroller_', type: 'address' },
      { internalType: 'contract InterestRateModel', name: 'interestRateModel_', type: 'address' },
      { internalType: 'string', name: 'name_', type: 'string' },
      { internalType: 'string', name: 'symbol_', type: 'string' },
      { internalType: 'uint256', name: 'reserveFactorMantissa_', type: 'uint256' },
      { internalType: 'uint256', name: 'adminFeeMantissa_', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'interestRateModel',
    outputs: [{ internalType: 'contract InterestRateModel', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'isCEther',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'isCToken',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'borrower', type: 'address' },
      { internalType: 'uint256', name: 'repayAmount', type: 'uint256' },
      { internalType: 'contract CTokenInterface', name: 'cTokenCollateral', type: 'address' },
    ],
    name: 'liquidateBorrow',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'mintAmount', type: 'uint256' }],
    name: 'mint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'protocolSeizeShareMantissa',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'redeemTokens', type: 'uint256' }],
    name: 'redeem',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'redeemAmount', type: 'uint256' }],
    name: 'redeemUnderlying',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'repayAmount', type: 'uint256' }],
    name: 'repayBorrow',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'borrower', type: 'address' },
      { internalType: 'uint256', name: 'repayAmount', type: 'uint256' },
    ],
    name: 'repayBorrowBehalf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'reserveFactorMantissa',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'liquidator', type: 'address' },
      { internalType: 'address', name: 'borrower', type: 'address' },
      { internalType: 'uint256', name: 'seizeTokens', type: 'uint256' },
    ],
    name: 'seize',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'supplyRatePerBlock',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalAdminFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalBorrows',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'totalBorrowsCurrent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalFuseFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalReserves',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'dst', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'src', type: 'address' },
      { internalType: 'address', name: 'dst', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'underlying',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

export const FODL_ADDRESS = '0x4c2e59d098df7b6cbae0848d66de2f8a4889b9c3'
export const FODL_ADDRESS_ON_MATIC = '0x5314bA045a459f63906Aa7C76d9F337DcB7d6995'
export const FODL_DECIMALS = 18

export const MANTISSA = BigNumber.from(10).pow(18)
export const XFODL_PER_TICKET = 1000
export const CLOSED_TRADE_BONUS = 50
export const CLOSED_TRADE_MIN_CONTRIBUTION = 5
export const BLOCKS_PER_DAY_ETHEREUM = (24 * 60 * 60) / 15 // every 15 seconds
export const BLOCKS_PER_DAY_MATIC = (24 * 60 * 60) / 2 //every 2 seconds
export const EVENTS_CHUNK_SIZE = 100000
export const USD_DECIMALS = 8
export const TRANSFER_EVENT_HASH = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export const EXCLUDE_LIST = [
  constants.AddressZero,
  LP_USDC_FODL_STAKING_ADDRESS,
  LP_ETH_FODL_STAKING_ADDRESS,
  LP_FODL_MATIC_STAKING_ADDRESS,
  RARI_XFODL_ADDRESS,
  '0x872c67dd383db7b7e9bc1800546f1ae715a0bc0c', // Team LP Address
  '0xf0c8c8b7cece4a5fb9010db52649e3ef3dc1a3e6', // Team LP Address
]
