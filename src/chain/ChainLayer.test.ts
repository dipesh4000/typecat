import { describe, expect, it, vi } from 'vitest'
import type { SmoothSendAvaxClient } from '@smoothsend/sdk/avax'
import { ChainLayer, type Transaction } from './ChainLayer'
import { transactionError } from './errors'

vi.mock('@smoothsend/sdk/avax', () => ({}))
vi.mock('./config', () => ({
  game: '0x1111111111111111111111111111111111111111',
  abi: ['registerPlayer', 'dailyCheckIn'].map(name => ({ type: 'function', name, stateMutability: 'nonpayable', inputs: [], outputs: [] })),
}))

function setup(submitCall = vi.fn().mockResolvedValue({ userOpHash: '0xuserop' })) {
  const transactions: Transaction[] = []
  const client = { submitCall, submitter: { waitForUserOperationReceipt: vi.fn().mockResolvedValue({ success: true, receipt: { transactionHash: '0xtransaction' } }) } }
  const layer = new ChainLayer(client as unknown as SmoothSendAvaxClient, '0x1111111111111111111111111111111111111111', tx => transactions.push(tx))
  return { layer, transactions, client }
}

describe('sponsored transaction lifecycle (mocked, no credit spending)', () => {
  it('emits every state and uses the mined transaction hash, not the UserOp hash', async () => {
    const { layer, transactions, client } = setup()
    await layer.write('Create player', 'registerPlayer')
    expect(transactions.map(tx => tx.state)).toEqual(['queued', 'signing', 'submitted', 'confirmed'])
    expect(transactions[2].userOpHash).toBe('0xuserop')
    expect(transactions[2].hash).toBeUndefined()
    expect(transactions[3]).toMatchObject({ hash: '0xtransaction', ms: expect.any(Number) })
    expect(client.submitCall).toHaveBeenCalledWith(expect.objectContaining({ mode: 'developer-sponsored', waitForReceipt: false }))
  })
  it('serializes writes through confirmation to avoid nonce collisions', async () => {
    let confirm!: (value: unknown) => void
    const { layer, client } = setup()
    client.submitter.waitForUserOperationReceipt.mockImplementationOnce(() => new Promise(resolve => { confirm = resolve }))
    const first = layer.write('Create player', 'registerPlayer')
    const second = layer.write('Daily check-in', 'dailyCheckIn')
    await vi.waitFor(() => expect(client.submitter.waitForUserOperationReceipt).toHaveBeenCalledOnce())
    expect(client.submitCall).toHaveBeenCalledOnce()
    confirm({ success: true, receipt: { transactionHash: '0xtransaction' } })
    await Promise.all([first, second])
    expect(client.submitCall).toHaveBeenCalledTimes(2)
  })
  it('reports actionable CORS errors without automatically retrying or poisoning the queue', async () => {
    const submit = vi.fn().mockRejectedValueOnce(new Error('CORS origin not allowed')).mockResolvedValue({ userOpHash: '0xuserop' })
    const { layer, transactions } = setup(submit)
    await expect(layer.write('Create player', 'registerPlayer')).rejects.toThrow('SmoothSend')
    expect(submit).toHaveBeenCalledOnce()
    expect(transactions.at(-1)).toMatchObject({ state: 'failed', error: expect.stringContaining('API-key CORS allowlist') })
    await layer.write('Daily check-in', 'dailyCheckIn')
    expect(transactions.at(-1)?.state).toBe('confirmed')
  })
  it('marks reverted and timed-out operations as failed, never confirmed', async () => {
    for (const receipt of [null, { success: false, receipt: { transactionHash: '0xtransaction' } }]) {
      const { layer, transactions, client } = setup()
      client.submitter.waitForUserOperationReceipt.mockResolvedValueOnce(receipt)
      await expect(layer.write('Create player', 'registerPlayer')).rejects.toThrow()
      expect(transactions.at(-1)?.state).toBe('failed')
      expect(transactions.some(tx => tx.state === 'confirmed')).toBe(false)
    }
  })
  it('identifies the exact rejected origin without changing unrelated errors', () => {
    expect(transactionError(new Error('CORS origin not allowed'), 'https://typecat-rust.vercel.app')).toContain('https://typecat-rust.vercel.app')
    expect(transactionError(new Error('User rejected signature'))).toBe('User rejected signature')
  })
})
