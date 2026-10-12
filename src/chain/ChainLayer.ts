import { createSmoothSendAvaxClient, fetchAvaxAaPublicDefaults, predictSimpleAccountAddress, type SmoothSendAvaxClient } from '@smoothsend/sdk/avax'
import { encodeFunctionData, type Address, type Hex, type WalletClient } from 'viem'
import { abi, apiKey, game, network, publicClient } from './config'

export type Transaction = { id: number; label: string; state: 'queued' | 'signing' | 'submitted' | 'confirmed' | 'failed'; hash?: string; error?: string }
export class ChainLayer {
  private queue: Promise<unknown> = Promise.resolve()
  private nextId = 0
  constructor(private client: SmoothSendAvaxClient, readonly account: Address, private notify: (tx: Transaction) => void) {}
  static async create(walletClient: WalletClient, owner: Address, notify: (tx: Transaction) => void) {
    const defaults = await fetchAvaxAaPublicDefaults()
    const factory = network === 'mainnet' ? defaults.simpleAccountFactoryMainnet : defaults.simpleAccountFactoryFuji
    if (!factory) throw new Error('SmoothSend account factory unavailable')
    const account = await predictSimpleAccountAddress({ publicClient, factory, owner, salt: 0n })
    const client = createSmoothSendAvaxClient({ apiKey, network, publicClient, walletClient, ownerAddress: owner, accountFactory: factory, accountSalt: 0n })
    return new ChainLayer(client, account, notify)
  }
  write(label: string, functionName: 'registerPlayer' | 'dailyCheckIn' | 'startSession' | 'finishSession' | 'claimAchievement', args: readonly unknown[] = []) {
    const tx: Transaction = { id: ++this.nextId, label, state: 'queued' }
    const emit = () => this.notify({ ...tx })
    emit()
    const run = async () => {
      try {
        if (!game) throw new Error('Contract address missing')
        tx.state = 'signing'; emit()
        const data = encodeFunctionData({ abi, functionName, args } as never)
        const sent = await this.client.submitCall({ call: { to: game, data }, mode: 'developer-sponsored', waitForReceipt: false })
        tx.state = 'submitted'; emit()
        const receipt = await this.client.submitter.waitForUserOperationReceipt(sent.userOpHash, { pollMs: 1000, timeoutMs: 120000 })
        if (!receipt) throw new Error('Confirmation timed out; check account history before retrying')
        tx.hash = receipt.receipt.transactionHash as Hex
        if (!receipt.success) throw new Error('Transaction reverted')
        tx.state = 'confirmed'; emit()
      } catch (error) {
        tx.state = 'failed'; tx.error = error instanceof Error ? error.message : String(error); emit(); throw error
      }
    }
    const pending = this.queue.then(run)
    // A failed operation does not poison unrelated future actions.
    this.queue = pending.catch(() => undefined)
    return pending
  }
}
