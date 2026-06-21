import { describe, it, expect, beforeEach } from 'vitest'
import { useStatsStore } from './statsStore'
import type { SessionResult } from '../shared/types'

const makeResult = (overrides: Partial<SessionResult> = {}): SessionResult => ({
  passageId: 'test-001',
  wpm: 60,
  accuracy: 95,
  consistency: 20,
  totalChars: 100,
  correctChars: 95,
  errorChars: 5,
  duration: 60000,
  timestamp: Date.now(),
  keystrokes: [],
  ...overrides,
})

describe('statsStore', () => {
  beforeEach(() => {
    useStatsStore.setState({
      bestWPM: 0,
      totalWordsTyped: 0,
      totalSessionsCompleted: 0,
      sessionHistory: [],
    })
  })

  describe('recordSession', () => {
    it('records a session and updates totals', () => {
      const result = makeResult({ wpm: 60, correctChars: 95 })
      useStatsStore.getState().recordSession(result)
      const state = useStatsStore.getState()
      expect(state.totalSessionsCompleted).toBe(1)
      expect(state.totalWordsTyped).toBe(95)
      expect(state.bestWPM).toBe(60)
      expect(state.sessionHistory).toHaveLength(1)
    })

    it('updates bestWPM only when new session is better', () => {
      useStatsStore.getState().recordSession(makeResult({ wpm: 60 }))
      useStatsStore.getState().recordSession(makeResult({ wpm: 40 }))
      expect(useStatsStore.getState().bestWPM).toBe(60)
    })

    it('keeps only the most recent MAX_HISTORY sessions', () => {
      for (let i = 0; i < 210; i++) {
        useStatsStore.getState().recordSession(makeResult({ wpm: 50 + i }))
      }
      expect(useStatsStore.getState().sessionHistory.length).toBe(200)
      expect(useStatsStore.getState().bestWPM).toBe(259)
    })
  })

  describe('getAverageWPM', () => {
    it('returns 0 with no sessions', () => {
      expect(useStatsStore.getState().getAverageWPM()).toBe(0)
    })

    it('calculates average WPM', () => {
      useStatsStore.getState().recordSession(makeResult({ wpm: 40 }))
      useStatsStore.getState().recordSession(makeResult({ wpm: 60 }))
      expect(useStatsStore.getState().getAverageWPM()).toBe(50)
    })
  })

  describe('getAverageAccuracy', () => {
    it('returns 0 with no sessions', () => {
      expect(useStatsStore.getState().getAverageAccuracy()).toBe(0)
    })

    it('calculates average accuracy', () => {
      useStatsStore.getState().recordSession(makeResult({ accuracy: 90 }))
      useStatsStore.getState().recordSession(makeResult({ accuracy: 100 }))
      expect(useStatsStore.getState().getAverageAccuracy()).toBe(95)
    })
  })

  describe('getRecentSessions', () => {
    it('returns requested number of sessions', () => {
      for (let i = 0; i < 10; i++) {
        useStatsStore.getState().recordSession(makeResult({ wpm: 50 + i }))
      }
      expect(useStatsStore.getState().getRecentSessions(3)).toHaveLength(3)
      expect(useStatsStore.getState().getRecentSessions(3)[0].wpm).toBe(59)
    })

    it('returns all sessions if count exceeds history', () => {
      useStatsStore.getState().recordSession(makeResult({ wpm: 50 }))
      expect(useStatsStore.getState().getRecentSessions(5)).toHaveLength(1)
    })
  })
})
