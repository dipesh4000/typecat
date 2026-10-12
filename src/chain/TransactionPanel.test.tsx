import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TransactionPanel } from './TransactionPanel'
import type { Transaction } from './ChainLayer'

afterEach(cleanup)
const props = { error: '', onDismiss: vi.fn(), explorer: 'https://testnet.snowtrace.io', network: 'Fuji testnet', configured: true }

describe('transaction side panel', () => {
  it('stays visible when idle and can be collapsed without hiding the activity button', () => {
    render(<TransactionPanel {...props} transactions={[]} />)
    expect(screen.getByText('Your sponsored transactions will appear here as you play.')).toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: /Onchain activity/ })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/Your sponsored transactions/)).not.toBeInTheDocument()
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
  it('shows lifecycle states and only links mined transaction hashes', () => {
    const transactions: Transaction[] = [
      { id: '1', label: 'Create player', state: 'confirmed', startedAt: 0, ms: 2300, hash: '0xtransaction' },
      { id: '2', label: 'Daily check-in', state: 'submitted', startedAt: 0, userOpHash: '0xuserop' },
      { id: '3', label: 'Start session', state: 'queued', startedAt: 0 },
      { id: '4', label: 'Finish session', state: 'failed', startedAt: 0, error: 'Transaction reverted' },
    ]
    render(<TransactionPanel {...props} transactions={transactions} />)
    expect(screen.getByText('2 pending')).toBeInTheDocument()
    expect(screen.getByText('Confirmed · 2.3s · Gas sponsored')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View transaction/ })).toHaveAttribute('href', 'https://testnet.snowtrace.io/tx/0xtransaction')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByText('Transaction reverted')).toBeInTheDocument()
  })
  it('offers manual connection retry and dismiss controls on errors', () => {
    const retry = vi.fn(), dismiss = vi.fn()
    render(<TransactionPanel {...props} transactions={[]} error="SmoothSend rejected this origin" onRetry={retry} onDismiss={dismiss} />)
    expect(screen.getByRole('alert')).toHaveTextContent('SmoothSend rejected this origin')
    fireEvent.click(screen.getByRole('button', { name: 'Retry connection' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(retry).toHaveBeenCalledOnce()
    expect(dismiss).toHaveBeenCalledOnce()
  })
})
