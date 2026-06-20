export { useTypingStore } from './typingStore'
export { useCatStore } from './catStore'
export { useProgressionStore } from './progressionStore'
export { useStatsStore } from './statsStore'
export { useSettingsStore } from './settingsStore'

import type { SessionResult } from '../shared/types'
import { useCatStore } from './catStore'
import { useProgressionStore } from './progressionStore'
import { useStatsStore } from './statsStore'
import { achievementDefs } from '../shared/achievements'

let celebrateTimeout: ReturnType<typeof setTimeout> | null = null

export function calculateXP(wpm: number, accuracy: number): number {
  const accuracyMultiplier = accuracy / 100
  const speedMultiplier = Math.min(wpm / 60, 1.5)
  return Math.round(wpm * accuracyMultiplier * speedMultiplier)
}

export function onSessionComplete(result: SessionResult): {
  xpEarned: number
  newAchievements: string[]
} {
  const statsStore = useStatsStore.getState()
  const progressionStore = useProgressionStore.getState()
  const catStore = useCatStore.getState()

  statsStore.recordSession(result)

  const xp = calculateXP(result.wpm, result.accuracy)
  progressionStore.awardXP(xp)
  progressionStore.recordDailyActivity()

  // Clear any pending celebrate timeout
  if (celebrateTimeout) {
    clearTimeout(celebrateTimeout)
  }

  catStore.setAnimationState('celebrating')
  celebrateTimeout = setTimeout(() => {
    catStore.setAnimationState('idle')
    celebrateTimeout = null
  }, 3000)

  const progressionState = useProgressionStore.getState()
  const unlockedIds = new Set(progressionState.unlockedAchievements.map((a) => a.id))
  const newAchievements: string[] = []

  for (const def of achievementDefs) {
    if (!unlockedIds.has(def.id) && def.condition()) {
      useProgressionStore.getState().unlockAchievement({
        id: def.id,
        name: def.name,
        description: def.description,
      })
      newAchievements.push(def.id)
    }
  }

  if (newAchievements.length > 0) {
    const details = newAchievements.map((id) => {
      const def = achievementDefs.find((d) => d.id === id)!
      return { id, name: def.name, description: def.description }
    })
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: details }))
  }

  return {
    xpEarned: xp,
    newAchievements,
  }
}