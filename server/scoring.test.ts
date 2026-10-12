import { describe, expect, it } from 'vitest'
import { score } from './scoring.ts'
const text = 'abcdefghijklmnopqrstuvwxyz'
const strokes = [...text].map((char, i) => ({ char, timestamp: i * 250 }))
describe('ranked scoring', () => {
  it('derives metrics from the canonical passage', () => {
    expect(score(text, strokes, 10000)).toEqual({ wpm: 31, accuracy: 100, duration: 10000 })
    expect(score(text, [{ char: '!', timestamp: 0 }, ...strokes.slice(1)], 10000).accuracy).toBe(96)
  })
  it('rejects incomplete, reversed, implausibly fast and invalid logs', () => {
    expect(() => score(text, strokes.slice(1), 10000)).toThrow()
    expect(() => score(text, [...strokes].reverse(), 10000)).toThrow()
    expect(() => score(text, strokes, 1)).toThrow()
    expect(() => score(text, [{ char: 'a', timestamp: NaN }, ...strokes.slice(1)], 10000)).toThrow()
  })
})
