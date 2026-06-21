import { describe, it, expect } from 'vitest'
import { calculateWPM, calculateAccuracy, calculateConsistency } from './metrics'
import type { Keystroke } from '../../shared/types'

describe('calculateWPM', () => {
  it('returns 0 for zero duration', () => {
    expect(calculateWPM(100, 0)).toBe(0)
  })

  it('returns 0 for negative duration', () => {
    expect(calculateWPM(100, -1000)).toBe(0)
  })

  it('calculates WPM correctly', () => {
    // 60 correct chars in 1 minute = 12 WPM (60/5)
    expect(calculateWPM(60, 60000)).toBe(12)
  })

  it('calculates WPM for partial minute', () => {
    // 25 correct chars in 30 seconds = 10 WPM (25/5 / 0.5)
    expect(calculateWPM(25, 30000)).toBe(10)
  })

  it('rounds to nearest integer', () => {
    // 33 correct chars in 60 seconds = 6.6 → 7
    expect(calculateWPM(33, 60000)).toBe(7)
  })
})

describe('calculateAccuracy', () => {
  it('returns 0 for zero total', () => {
    expect(calculateAccuracy(0, 0)).toBe(0)
  })

  it('returns 100 for perfect accuracy', () => {
    expect(calculateAccuracy(50, 50)).toBe(100)
  })

  it('returns 0 for all errors', () => {
    expect(calculateAccuracy(0, 50)).toBe(0)
  })

  it('calculates accuracy correctly', () => {
    expect(calculateAccuracy(90, 100)).toBe(90)
  })

  it('rounds to nearest integer', () => {
    expect(calculateAccuracy(1, 3)).toBe(33)
  })
})

describe('calculateConsistency', () => {
  it('returns 0 for fewer than 2 keystrokes', () => {
    expect(calculateConsistency([])).toBe(0)
    expect(calculateConsistency([{ char: 'a', expected: 'a', timestamp: 100, correct: true }])).toBe(0)
  })

  it('returns 0 for perfectly consistent timing', () => {
    const keystrokes: Keystroke[] = [
      { char: 'a', expected: 'a', timestamp: 0, correct: true },
      { char: 'b', expected: 'b', timestamp: 100, correct: true },
      { char: 'c', expected: 'c', timestamp: 200, correct: true },
      { char: 'd', expected: 'd', timestamp: 300, correct: true },
    ]
    expect(calculateConsistency(keystrokes)).toBe(0)
  })

  it('returns higher value for inconsistent timing', () => {
    const consistent: Keystroke[] = [
      { char: 'a', expected: 'a', timestamp: 0, correct: true },
      { char: 'b', expected: 'b', timestamp: 100, correct: true },
      { char: 'c', expected: 'c', timestamp: 200, correct: true },
    ]
    const inconsistent: Keystroke[] = [
      { char: 'a', expected: 'a', timestamp: 0, correct: true },
      { char: 'b', expected: 'b', timestamp: 50, correct: true },
      { char: 'c', expected: 'c', timestamp: 300, correct: true },
    ]
    expect(calculateConsistency(inconsistent)).toBeGreaterThan(calculateConsistency(consistent))
  })
})
