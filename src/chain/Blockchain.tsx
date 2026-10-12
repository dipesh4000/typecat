import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { PrivyProvider, useLoginWithOAuth, usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, keccak256, stringToHex, type Address } from 'viem'
import { ChainLayer, type Transaction } from './ChainLayer'
import { abi, appId, chain, configured, explorer, game, publicClient, verifierUrl } from './config'
import { useTypingStore } from '../stores/typingStore'
import { AuthGate } from './AuthGate'
import { TransactionPanel } from './TransactionPanel'
import { transactionError } from './errors'

const AccountContext = createContext<ReactNode>(null)
export function AccountControls() { return <>{useContext(AccountContext)}</> }
export function Blockchain({ children }: { children: ReactNode }) {
  if (!appId) return <AuthGate ready authenticated={false}>{children}</AuthGate>
  return <PrivyProvider appId={appId} config={{ loginMethods: ['email', 'google'], embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' }, showWalletUIs: false }, defaultChain: chain, supportedChains: [chain] }}><Connected>{children}</Connected></PrivyProvider>
}
function Connected({ children }: { children: ReactNode }) {
  const { authenticated, login, logout, ready } = usePrivy()
  const { initOAuth } = useLoginWithOAuth()
  const { wallets } = useWallets()
  const embedded = wallets.find(w => w.walletClientType === 'privy')
  const address = embedded?.address
  const [account, setAccount] = useState<Address>()
  const [error, setError] = useState('')
  const [txs, setTxs] = useState<Transaction[]>([])
  const [attempt, setAttempt] = useState(0)
  const [connecting, setConnecting] = useState(true)
  useEffect(() => {
    if (!configured || !authenticated || !embedded) return
    let disposed = false
    let unsubscribe: (() => void) | undefined
    const fail = (e: unknown) => { if (!disposed) setError(transactionError(e)) }
    void (async () => {
      const actualChainId = await publicClient.getChainId()
      if (actualChainId !== chain.id) throw new Error(`RPC is on chain ${actualChainId}; TypeCat expects ${chain.name} (${chain.id}). Check VITE_RPC_URL.`)
      const code = await publicClient.getBytecode({ address: game! })
      if (!code || code === '0x') throw new Error(`No TypeCat contract at ${game} on ${chain.name} (${chain.id}). This address is deployed on Fuji; set VITE_GAME_ADDRESS to the Avalanche mainnet deployment address and redeploy.`)
      const wallet = embedded
      await wallet.switchChain(chain.id)
      const provider = await wallet.getEthereumProvider()
      const layer = await ChainLayer.create(createWalletClient({ account: wallet.address as Address, chain, transport: custom(provider) }), wallet.address as Address, tx => {
        if (!disposed) setTxs(prev => [tx, ...prev.filter(p => p.id !== tx.id)].slice(0, 10))
      })
      if (disposed) return
      const registered = await publicClient.readContract({ address: game!, abi, functionName: 'registered', args: [layer.account] })
      if (disposed) return
      if (!registered) await layer.write('Create player', 'registerPlayer')
      const lastDay = await publicClient.readContract({ address: game!, abi, functionName: 'lastCheckIn', args: [layer.account] })
      const block = await publicClient.getBlock()
      if (disposed) return
      if (lastDay !== block.timestamp / 86400n) await layer.write('Daily check-in', 'dailyCheckIn')
      if (disposed) return
      setAccount(layer.account); setError('')
      let active: { id: `0x${string}`; started: Promise<void>; paused: boolean } | undefined
      unsubscribe = useTypingStore.subscribe((state, prev) => {
        if (state.status === 'active' && (prev.status === 'idle' || prev.status === 'complete') && state.passage && state.passage.category !== 'custom') {
          const id = keccak256(stringToHex(crypto.randomUUID()))
          const started = layer.write('Start typing session', 'startSession', [id, keccak256(stringToHex(state.passage.id))])
          void started.catch(fail)
          active = { id, started, paused: false }
        }
        if (state.status === 'paused' && active) active.paused = true
        if (state.status === 'idle') active = undefined
        if (state.status !== 'complete' || prev.status === 'complete' || !active || !state.lastResult) return
        const session = active; active = undefined
        if (session.paused) { fail(new Error('Paused session saved locally; rankings require uninterrupted typing')); return }
        const result = state.lastResult
        void (async () => {
          await session.started
          const response = await fetch(`${verifierUrl}/verify`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: session.id, player: layer.account, passageId: result.passageId, duration: result.duration, keystrokes: result.keystrokes }) })
          const proof = await response.json()
          if (!response.ok) throw new Error(proof.error || 'Verification unavailable')
          await layer.write('Record verified result', 'finishSession', [session.id, proof.wpm, proof.accuracy, proof.duration, proof.logHash, proof.signature])
          const badges = [1, ...(proof.wpm >= 60 ? [2] : []), ...(proof.accuracy === 100 ? [3] : [])]
          for (const badge of badges) {
            if (!await publicClient.readContract({ address: game!, abi, functionName: 'badges', args: [layer.account, badge] })) await layer.write('Claim achievement', 'claimAchievement', [badge])
          }
        })().catch(fail)
      })
    })().catch(fail).finally(() => { if (!disposed) setConnecting(false) })
    return () => { disposed = true; unsubscribe?.() }
    // Embedded wallet identity can change; reconnect only for a different owner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, address, attempt])
  const controls = <div className="flex items-center gap-2 text-xs"><span className="max-w-36 truncate text-on-surface-variant">{account ? `${account.slice(0, 6)}…${account.slice(-4)}` : error ? 'Chain setup failed' : configured ? 'Preparing account…' : 'Practice mode'}</span><button className="shrink-0 border border-outline-variant rounded-lg px-2 py-1.5" onClick={() => { setAccount(undefined); setTxs([]); setError(''); void logout() }}>Log out</button></div>
  return <AuthGate ready={ready} authenticated={authenticated} onLogin={login} onGoogleLogin={() => { void initOAuth({ provider: 'google' }) }}><AccountContext.Provider value={controls}>
    {children}
    <TransactionPanel transactions={txs} error={error} onDismiss={() => setError('')} onRetry={!account && !connecting && configured ? () => { setError(''); setConnecting(true); setAttempt(previous => previous + 1) } : undefined} explorer={explorer} network={chain.id === 43113 ? 'Fuji testnet' : 'Avalanche'} configured={configured} />
  </AccountContext.Provider></AuthGate>
}
