import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import solc from 'solc'
import { createPublicClient, createWalletClient, http, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { avalanche, avalancheFuji } from 'viem/chains'
const require = createRequire(import.meta.url)
const input = { language: 'Solidity', sources: { 'TypeCatGame.sol': { content: readFileSync(new URL('../contracts/TypeCatGame.sol', import.meta.url), 'utf8') } }, settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'cancun', outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } } }
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: (path: string) => { try { return { contents: readFileSync(require.resolve(path), 'utf8') } } catch { return { error: `Missing import ${path}` } } } }))
for (const error of output.errors || []) console.log(error.formattedMessage)
if (output.errors?.some((e: { severity: string }) => e.severity === 'error')) process.exit(1)
const contract = output.contracts['TypeCatGame.sol'].TypeCatGame
console.log('TypeCatGame compiled successfully')
if (process.argv.includes('--deploy')) {
  if (!process.env.DEPLOYER_PRIVATE_KEY || !process.env.VERIFIER_PRIVATE_KEY) throw new Error('Set deployment and verifier keys in server environment')
  const chain = process.env.NETWORK === 'mainnet' ? avalanche : avalancheFuji
  const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY as Hex)
  const signer = privateKeyToAccount(process.env.VERIFIER_PRIVATE_KEY as Hex)
  const client = createWalletClient({ account, chain, transport: http(process.env.RPC_URL) })
  const hash = await client.deployContract({ abi: contract.abi, bytecode: `0x${contract.evm.bytecode.object}`, args: [signer.address] })
  const receipt = await createPublicClient({ chain, transport: http(process.env.RPC_URL) }).waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error('Deployment reverted')
  console.log({ contract: receipt.contractAddress, block: receipt.blockNumber.toString(), transaction: hash })
}
