import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import { createPublicClient, http, isAddress, keccak256, parseAbi, stringToHex, type Address, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { avalanche, avalancheFuji } from 'viem/chains'
import { score } from './scoring.js'
import english from '../src/data/passages/english.json' with { type: 'json' }
import anime from '../src/data/passages/anime.json' with { type: 'json' }
import programming from '../src/data/passages/programming.json' with { type: 'json' }

const abi = parseAbi(['function sessions(bytes32) view returns (address player, bytes32 passage, uint64 startedAt, bool complete)'])
const passages = [...english, ...anime, ...programming]
export const app = new Hono()
app.use('*', cors({ origin: (process.env.ALLOWED_ORIGINS || 'https://typecat-rust.vercel.app,http://localhost:5173').split(',').map(origin => origin.trim()) }))
app.use('*', bodyLimit({ maxSize: 500000 }))
app.use('*', async (c, next) => { c.header('Cache-Control', 'no-store'); await next() })
app.get('/api/health', c => c.json({ ok: true, configured: Boolean(process.env.GAME_ADDRESS && process.env.VERIFIER_PRIVATE_KEY), network: process.env.NETWORK || 'fuji' }))
app.post('/api/verify', async c => {
  const game = process.env.GAME_ADDRESS as Address | undefined
  const key = process.env.VERIFIER_PRIVATE_KEY as Hex | undefined
  if (!game || !isAddress(game) || !key || !/^0x[0-9a-fA-F]{64}$/.test(key)) return c.json({ error: 'Verifier is not configured yet' }, 503)
  try {
    const chain = process.env.NETWORK === 'mainnet' ? avalanche : avalancheFuji
    const signer = privateKeyToAccount(key)
    const client = createPublicClient({ chain, transport: http(process.env.RPC_URL, { timeout: 15000, retryCount: 1 }) })
    const body = await c.req.json()
    if (!body || typeof body.player !== 'string' || !isAddress(body.player) || typeof body.sessionId !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(body.sessionId)) throw new Error('Invalid player or session')
    const passage = passages.find(p => p.id === body.passageId)
    if (!passage) throw new Error('Custom passages are practice only')
    const [player, passageHash, startedAt, complete] = await client.readContract({ address: game, abi, functionName: 'sessions', args: [body.sessionId] })
    if (player.toLowerCase() !== body.player.toLowerCase() || complete || passageHash !== keccak256(stringToHex(passage.id))) throw new Error('Session does not match chain state')
    const result = score(passage.text, body.keystrokes, body.duration)
    const block = await client.getBlock()
    if (block.timestamp - startedAt > 3600n || result.duration > Number(block.timestamp - startedAt) * 1000 + 15000) throw new Error('Session timing does not match chain state')
    const logHash = keccak256(stringToHex(JSON.stringify(body.keystrokes)))
    const signature = await signer.signTypedData({
      domain: { name: 'TypeCat', version: '1', chainId: chain.id, verifyingContract: game },
      types: { Result: [{ name: 'sessionId', type: 'bytes32' }, { name: 'player', type: 'address' }, { name: 'wpm', type: 'uint32' }, { name: 'accuracy', type: 'uint32' }, { name: 'duration', type: 'uint32' }, { name: 'logHash', type: 'bytes32' }] },
      primaryType: 'Result', message: { sessionId: body.sessionId, player, ...result, logHash },
    })
    return c.json({ ...result, logHash, signature })
  } catch (error) { return c.json({ error: error instanceof Error ? error.message : 'Verification failed' }, 400) }
})
app.all('/api/verify', c => c.json({ error: 'Use POST for verification' }, 405))
app.notFound(c => c.json({ error: 'API route not found' }, 404))
