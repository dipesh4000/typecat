import { useState } from 'react'
import type { Transaction } from './ChainLayer'

const stateText: Record<Transaction['state'], string> = {
  queued: 'Queued', signing: 'Signing & sponsoring', submitted: 'Waiting for confirmation', confirmed: 'Confirmed', failed: 'Failed',
}
const stateIcon: Record<Transaction['state'], string> = {
  queued: 'schedule', signing: 'draw', submitted: 'hourglass_top', confirmed: 'check_circle', failed: 'error',
}

export function TransactionPanel({ transactions, error, onDismiss, onRetry, explorer, network, configured }: {
  transactions: Transaction[]
  error: string
  onDismiss: () => void
  onRetry?: () => void
  explorer: string
  network: string
  configured: boolean
}) {
  const [open, setOpen] = useState(true)
  const pending = transactions.filter(tx => !['confirmed', 'failed'].includes(tx.state)).length
  return (
    <aside className="fixed right-3 bottom-20 md:bottom-4 z-40 w-80 max-w-[calc(100vw-24px)] rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl text-on-surface" aria-label="Transaction activity">
      <button className="w-full flex items-center gap-2 p-3 text-left" aria-expanded={open} aria-controls="transaction-activity" onClick={() => setOpen(!open)}>
        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">receipt_long</span>
        <span className="font-semibold text-xs">Onchain activity</span>
        <span className="ml-auto text-[10px] text-on-surface-variant">{pending ? `${pending} pending` : network}</span>
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{open ? 'expand_more' : 'expand_less'}</span>
      </button>
      {open && <div id="transaction-activity" className="max-h-[min(50svh,400px)] overflow-y-auto border-t border-outline-variant p-3 space-y-2 text-xs">
        {error && <div className="rounded-lg border border-error/30 bg-error/5 p-3" role="alert"><p className="text-error break-words">{error}</p><div className="flex gap-4 mt-2">{onRetry && <button onClick={onRetry} className="font-semibold text-primary">Retry connection</button>}<button onClick={onDismiss} className="text-on-surface-variant">Dismiss</button></div></div>}
        <div aria-live="polite" aria-relevant="additions text" className="space-y-2">
          {!transactions.length && <p className="py-2 text-on-surface-variant leading-relaxed">{configured ? 'Your sponsored transactions will appear here as you play.' : 'Practice mode — blockchain is not configured yet.'}</p>}
          {transactions.map(tx => <div key={tx.id} className={`border-l-2 rounded-r-lg bg-surface-container-low p-2.5 ${tx.state === 'failed' ? 'border-error' : tx.state === 'confirmed' ? 'border-success' : 'border-primary'}`}>
            <div className="flex items-center gap-2"><span className={`material-symbols-outlined text-[16px] ${tx.state === 'failed' ? 'text-error' : tx.state === 'confirmed' ? 'text-success' : 'text-primary'}`} aria-hidden="true">{stateIcon[tx.state]}</span><span className="font-medium">{tx.label}</span></div>
            <p className="mt-1 text-[10px] text-on-surface-variant">{stateText[tx.state]}{tx.ms !== undefined && ` · ${(tx.ms / 1000).toFixed(1)}s`}{tx.state === 'confirmed' && ' · Gas sponsored'}</p>
            {tx.userOpHash && !tx.hash && <p className="mt-1 text-[10px] text-on-surface-variant break-all">UserOp: {tx.userOpHash.slice(0, 12)}…</p>}
            {tx.hash && <a className="mt-1 inline-block text-[10px] text-primary underline underline-offset-2" href={`${explorer}/tx/${tx.hash}`} target="_blank" rel="noreferrer">View transaction ↗</a>}
            {tx.error && <p className="text-error mt-1 text-[10px] break-words">{tx.error}</p>}
          </div>)}
        </div>
        <p className="pt-1 text-[9px] text-on-surface-variant">Powered by SmoothSend · Recent activity in this session</p>
      </div>}
    </aside>
  )
}
