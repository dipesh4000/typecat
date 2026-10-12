import { createPublicClient, http, parseAbi, type Address } from 'viem'
import { avalanche, avalancheFuji } from 'viem/chains'

export const chain = import.meta.env.VITE_NETWORK === 'mainnet' ? avalanche : avalancheFuji
export const network = chain.id === 43114 ? 'mainnet' : 'testnet'
export const explorer = chain.id === 43114 ? 'https://snowtrace.io' : 'https://testnet.snowtrace.io'
export const appId = import.meta.env.VITE_PRIVY_APP_ID || ''
export const apiKey = import.meta.env.VITE_SMOOTHSEND_KEY || ''
export const game = import.meta.env.VITE_GAME_ADDRESS as Address | undefined
// Same-origin Vercel Functions; overrides must include the other deployment's /api.
export const verifierUrl = (import.meta.env.VITE_VERIFIER_URL || '/api').replace(/\/$/, '')
export const publicClient = createPublicClient({ chain, transport: http(import.meta.env.VITE_RPC_URL || undefined) })
export const configured = Boolean(appId && apiKey && game)
export const abi = parseAbi([
  'function registered(address) view returns (bool)',
  'function lastCheckIn(address) view returns (uint256)',
  'function registerPlayer()',
  'function dailyCheckIn()',
  'function startSession(bytes32 id, bytes32 passage)',
  'function finishSession(bytes32 id, uint32 wpm, uint32 accuracy, uint32 duration, bytes32 logHash, bytes signature)',
  'function claimAchievement(uint8 badge)',
  'function badges(address, uint8) view returns (bool)',
  'event SessionFinished(bytes32 indexed sessionId, address indexed player, uint256 indexed day, bytes32 passage, uint32 wpm, uint32 accuracy, uint32 duration, bytes32 logHash)',
])
