import { createSmoothSendAvaxClient, fetchAvaxAaPublicDefaults, predictSimpleAccountAddress, type SmoothSendAvaxClient } from '@smoothsend/sdk/avax'
import { encodeFunctionData, type Address, type Hex, type WalletClient } from 'viem'
import { abi, apiKey, game, network, publicClient } from './config'
import { transactionError } from './errors'

export type Transaction = { id: string; label: string; state: 'queued' | 'signing' | 'submitted' | 'confirmed' | 'failed'; startedAt: number; ms?: number; userOpHash?: string; hash?: string; error?: string }
export class ChainLayer {
  private queue: Promise<unknown> = Promise.resolve()
  constructor(private client: SmoothSendAvaxClient, readonly account: Address, private notify: (tx: Transaction) => void) {}
  static async create(walletClient: WalletClient, owner: Address, notify: (tx: Transaction) => void) {
    if (!apiKey.startsWith('pk_nogas_')) throw new Error('Set VITE_SMOOTHSEND_KEY to the publishable pk_nogas_ key, never a secret key.')
    const defaults = await fetchAvaxAaPublicDefaults()
    const factory = network === 'mainnet' ? defaults.simpleAccountFactoryMainnet : defaults.simpleAccountFactoryFuji
    if (!factory) throw new Error('SmoothSend account factory unavailable')
    const account = await predictSimpleAccountAddress({ publicClient, factory, owner, salt: 0n })
    const client = createSmoothSendAvaxClient({ apiKey, network, publicClient, walletClient, ownerAddress: owner, accountFactory: factory, accountSalt: 0n })
    return new ChainLayer(client, account, notify)
  }
  write(label: string, functionName: 'registerPlayer' | 'dailyCheckIn' | 'startSession' | 'finishSession' | 'claimAchievement', args: readonly unknown[] = []) {
    const tx: Transaction = { id: crypto.randomUUID(), label, state: 'queued', startedAt: Date.now() }
    const emit = () => this.notify({ ...tx })
    emit()
    const run = async () => {
      try {
        if (!game) throw new Error('Contract address missing')
        tx.state = 'signing'; emit()
        const data = encodeFunctionData({ abi, functionName, args } as never)
        const sent = await this.client.submitCall({ call: { to: game, data }, mode: 'developer-sponsored', waitForReceipt: false })
        tx.userOpHash = sent.userOpHash
        tx.state = 'submitted'; emit()
        const receipt = await this.client.submitter.waitForUserOperationReceipt(sent.userOpHash, { pollMs: 1000, timeoutMs: 120000 })
        if (!receipt) throw new Error('Confirmation timed out; check account history before retrying')
        tx.hash = receipt.receipt.transactionHash as Hex
        if (!receipt.success) throw new Error('Transaction reverted')
        tx.ms = Date.now() - tx.startedAt
        tx.state = 'confirmed'; emit()
      } catch (error) {
        tx.ms = Date.now() - tx.startedAt
        tx.state = 'failed'; tx.error = transactionError(error); emit(); throw new Error(tx.error, { cause: error })
      }
    }
    const pending = this.queue.then(run)
    // A failed operation does not poison unrelated future actions.
    this.queue = pending.catch(() => undefined)
    return pending
  }
}
