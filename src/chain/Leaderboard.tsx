import { useEffect, useState } from 'react'
import { keccak256, stringToHex } from 'viem'
import { abi, explorer, game, publicClient } from './config'
import english from '../data/passages/english.json'
import anime from '../data/passages/anime.json'
import programming from '../data/passages/programming.json'

type Row = { player: string; wpm: number; accuracy: number; passage: string; day: number; hash: string }
const passages = [...english, ...anime, ...programming]
export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([])
  const [period, setPeriod] = useState('daily')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [today] = useState(() => Math.floor(Date.now() / 86400000))
  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!game) throw new Error('Leaderboard becomes available after the TypeCat contract is configured.')
      const latest = await publicClient.getBlockNumber()
      const out: Row[] = []
      const deployBlock = import.meta.env.VITE_DEPLOY_BLOCK
      if (!deployBlock || !/^\d+$/.test(deployBlock)) throw new Error('Set VITE_DEPLOY_BLOCK to the contract deployment block')
      for (let from = BigInt(deployBlock); from <= latest && !cancelled; from += 2048n) {
        const logs = await publicClient.getLogs({ address: game, event: abi[8], fromBlock: from, toBlock: from + 2047n > latest ? latest : from + 2047n })
        for (const log of logs) {
          const a = log.args
          if (a.player && a.wpm !== undefined && a.accuracy !== undefined && a.passage && a.day !== undefined && log.transactionHash) out.push({ player: a.player, wpm: a.wpm, accuracy: a.accuracy, passage: a.passage, day: Number(a.day), hash: log.transactionHash })
        }
      }
      if (!cancelled) { setRows(out); setLoading(false) }
    })().catch(e => { if (!cancelled) { setError(String(e.message || e)); setLoading(false) } })
    return () => { cancelled = true }
  }, [])
  const best = new Map<string, Row>()
  for (const row of rows) {
    const passage = passages.find(p => keccak256(stringToHex(p.id)) === row.passage)
    if ((period === 'daily' && row.day !== today) || (period === 'weekly' && row.day < today - 6)) continue
    if (category !== 'all' && passage?.category !== category) continue
    if (difficulty !== 'all' && passage?.difficulty !== difficulty) continue
    const prev = best.get(row.player)
    if (!prev || row.wpm > prev.wpm || (row.wpm === prev.wpm && row.accuracy > prev.accuracy)) best.set(row.player, row)
  }
  const ranked = [...best.values()].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
  return <section><h1 className="text-2xl font-bold mb-3">Leaderboard</h1><p className="text-sm text-on-surface-variant mb-4">Recorded results on Avalanche · daily rankings use UTC.</p><div className="flex gap-3 mb-4">{[[period, setPeriod, ['daily', 'weekly', 'all-time']], [category, setCategory, ['all', 'english', 'anime', 'programming']], [difficulty, setDifficulty, ['all', 'easy', 'medium', 'hard']]].map(([value, setter, options], i) => <select key={i} aria-label={['Period', 'Category', 'Difficulty'][i]} className="bg-surface-container p-2 rounded" value={value as string} onChange={e => (setter as (value: string) => void)(e.target.value)}>{(options as string[]).map(o => <option key={o}>{o}</option>)}</select>)}</div>{error ? <p>{error}</p> : loading ? <p>Reading recorded results…</p> : !ranked.length ? <p>No results yet. Complete a ranked passage to appear here.</p> : <table className="w-full text-left text-sm"><thead><tr><th>Rank</th><th>Player</th><th>WPM</th><th>Accuracy</th><th>Proof</th></tr></thead><tbody>{ranked.map((r, i) => <tr className="border-t border-outline-variant" key={r.player}><td className="py-3">{i + 1}</td><td>{r.player.slice(0,6)}…{r.player.slice(-4)}</td><td>{r.wpm}</td><td>{r.accuracy}%</td><td><a className="underline" href={`${explorer}/tx/${r.hash}`} target="_blank" rel="noreferrer">Transaction</a></td></tr>)}</tbody></table>}</section>
}
