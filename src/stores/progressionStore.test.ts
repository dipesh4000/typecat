import { describe, it, expect, beforeEach } from 'vitest'
import { useProgressionStore } from './progressionStore'

describe('progressionStore', () => {
  beforeEach(() => {
    useProgressionStore.setState({
      xp: 0,
      level: 1,
      unlockedAchievements: [],
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
    })
  })

  describe('awardXP', () => {
    it('awards XP within same level', () => {
      useProgressionStore.getState().awardXP(50)
      const state = useProgressionStore.getState()
      expect(state.xp).toBe(50)
      expect(state.level).toBe(1)
    })

    it('levels up when XP exceeds threshold', () => {
      // Level 1 needs 100 * 1^1.5 = 100 XP
      useProgressionStore.getState().awardXP(100)
      const state = useProgressionStore.getState()
      expect(state.level).toBe(2)
      expect(state.xp).toBe(0)
    })

    it('handles multiple level ups', () => {
      // Level 1: 100 XP, Level 2: 282 XP (100 * 2^1.5)
      useProgressionStore.getState().awardXP(400)
      const state = useProgressionStore.getState()
      expect(state.level).toBeGreaterThanOrEqual(2)
    })
  })

  describe('unlockAchievement', () => {
    it('unlocks an achievement', () => {
      useProgressionStore.getState().unlockAchievement({
        id: 'test-achievement',
        name: 'Test',
        description: 'Test achievement',
      })
      expect(useProgressionStore.getState().unlockedAchievements).toHaveLength(1)
      expect(useProgressionStore.getState().unlockedAchievements[0].id).toBe('test-achievement')
    })

    it('does not unlock duplicate achievements', () => {
      useProgressionStore.getState().unlockAchievement({ id: 'a', name: 'A', description: '' })
      useProgressionStore.getState().unlockAchievement({ id: 'a', name: 'A', description: '' })
      expect(useProgressionStore.getState().unlockedAchievements).toHaveLength(1)
    })
  })

  describe('recordDailyActivity', () => {
    it('records streak for today', () => {
      useProgressionStore.getState().recordDailyActivity()
      const state = useProgressionStore.getState()
      expect(state.currentStreak).toBe(1)
      expect(state.lastSessionDate).toBe(new Date().toISOString().split('T')[0])
    })

    it('does not double-count same day', () => {
      useProgressionStore.getState().recordDailyActivity()
      useProgressionStore.getState().recordDailyActivity()
      expect(useProgressionStore.getState().currentStreak).toBe(1)
    })

    it('increments streak for consecutive days', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      useProgressionStore.setState({
        lastSessionDate: yesterday.toISOString().split('T')[0],
        currentStreak: 3,
      })
      useProgressionStore.getState().recordDailyActivity()
      expect(useProgressionStore.getState().currentStreak).toBe(4)
    })

    it('resets streak for non-consecutive days', () => {
      useProgressionStore.setState({
        lastSessionDate: '2020-01-01',
        currentStreak: 10,
      })
      useProgressionStore.getState().recordDailyActivity()
      expect(useProgressionStore.getState().currentStreak).toBe(1)
    })
  })

  describe('getXPForNextLevel', () => {
    it('returns correct XP for level 1', () => {
      expect(useProgressionStore.getState().getXPForNextLevel()).toBe(100)
    })
  })

  describe('getXPProgress', () => {
    it('returns 0 with no XP', () => {
      expect(useProgressionStore.getState().getXPProgress()).toBe(0)
    })

    it('returns fraction of XP earned', () => {
      useProgressionStore.getState().awardXP(50)
      expect(useProgressionStore.getState().getXPProgress()).toBe(0.5)
    })
  })
})
