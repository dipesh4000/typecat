import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storage } from '../services/storage'

interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt?: number
}

interface ProgressionState {
  xp: number
  level: number
  unlockedAchievements: Achievement[]
  currentStreak: number
  longestStreak: number
  lastSessionDate: string | null

  awardXP: (amount: number) => void
  unlockAchievement: (achievement: Achievement) => void
  recordDailyActivity: () => void
  getXPForNextLevel: () => number
  getXPProgress: () => number
}

const xpForLevel = (level: number): number => Math.floor(100 * Math.pow(level, 1.5))

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      unlockedAchievements: [],
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,

      awardXP: (amount) => {
        const { xp, level } = get()
        let newXP = xp + amount
        let newLevel = level

        while (newXP >= xpForLevel(newLevel)) {
          newXP -= xpForLevel(newLevel)
          newLevel += 1
        }

        set({ xp: newXP, level: newLevel })
      },

      unlockAchievement: (achievement) => {
        const { unlockedAchievements } = get()
        if (unlockedAchievements.some((a) => a.id === achievement.id)) {
          return
        }
        set({
          unlockedAchievements: [
            ...unlockedAchievements,
            { ...achievement, unlockedAt: Date.now() },
          ],
        })
      },

      recordDailyActivity: () => {
        const { lastSessionDate, currentStreak, longestStreak } = get()
        const today = new Date().toISOString().split('T')[0]

        if (lastSessionDate === today) {
          return
        }

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let newStreak: number
        if (lastSessionDate === yesterdayStr) {
          newStreak = currentStreak + 1
        } else {
          newStreak = 1
        }

        set({
          lastSessionDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
        })
      },

      getXPForNextLevel: () => xpForLevel(get().level),

      getXPProgress: () => {
        const { xp, level } = get()
        return xp / xpForLevel(level)
      },
    }),
    {
      name: 'typecat:v1:progression',
      storage: {
        getItem: (name) => {
          const value = storage.get<ProgressionState>(name)
          return value ? { state: value, version: 0 } : null
        },
        setItem: (name, value) => storage.set(name, value.state),
        removeItem: (name) => storage.remove(name),
      },
    }
  )
)