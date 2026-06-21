import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storage } from '../services/storage'
import type { SessionResult } from '../shared/types'

interface StatsState {
  bestWPM: number
  totalWordsTyped: number
  totalSessionsCompleted: number
  sessionHistory: SessionResult[]

  recordSession: (result: SessionResult) => void
  getAverageWPM: () => number
  getAverageAccuracy: () => number
  getRecentSessions: (count: number) => SessionResult[]
}

const MAX_HISTORY = 200

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      bestWPM: 0,
      totalWordsTyped: 0,
      totalSessionsCompleted: 0,
      sessionHistory: [],

      recordSession: (result) => {
        const { sessionHistory, bestWPM } = get()
        const newHistory = [result, ...sessionHistory].slice(0, MAX_HISTORY)

        set({
          bestWPM: Math.max(bestWPM, result.wpm),
          totalWordsTyped: get().totalWordsTyped + result.correctChars,
          totalSessionsCompleted: get().totalSessionsCompleted + 1,
          sessionHistory: newHistory,
        })
      },

      getAverageWPM: () => {
        const { sessionHistory } = get()
        if (sessionHistory.length === 0) return 0
        const total = sessionHistory.reduce((sum, s) => sum + s.wpm, 0)
        return Math.round(total / sessionHistory.length)
      },

      getAverageAccuracy: () => {
        const { sessionHistory } = get()
        if (sessionHistory.length === 0) return 0
        const total = sessionHistory.reduce((sum, s) => sum + s.accuracy, 0)
        return Math.round(total / sessionHistory.length)
      },

      getRecentSessions: (count) => {
        return get().sessionHistory.slice(0, count)
      },
    }),
    {
      name: 'typecat:v1:stats',
      storage: {
        getItem: (name) => {
          const value = storage.get<StatsState>(name)
          return value ? { state: value, version: 0 } : null
        },
        setItem: (name, value) => storage.set(name, value.state),
        removeItem: (name) => storage.remove(name),
      },
    }
  )
)