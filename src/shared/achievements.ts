import { useProgressionStore } from '../stores/progressionStore'
import { useStatsStore } from '../stores/statsStore'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  condition: () => boolean
  category: 'speed' | 'accuracy' | 'streak' | 'level'
}

export const achievementDefs: AchievementDef[] = [
  {
    id: 'first-session',
    name: 'First Steps',
    description: 'Complete your first typing session',
    icon: 'flag',
    category: 'level',
    condition: () => useStatsStore.getState().totalSessionsCompleted >= 1,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Reach 60 WPM in a session',
    icon: 'speed',
    category: 'speed',
    condition: () => useStatsStore.getState().sessionHistory.some((s) => s.wpm >= 60),
  },
  {
    id: 'accuracy-master',
    name: 'Accuracy Master',
    description: 'Complete a session with 100% accuracy',
    icon: 'target',
    category: 'accuracy',
    condition: () => useStatsStore.getState().sessionHistory.some((s) => s.accuracy === 100),
  },
  {
    id: 'streak-keeper',
    name: 'Streak Keeper',
    description: 'Maintain a 7-day streak',
    icon: 'local_fire_department',
    category: 'streak',
    condition: () => useProgressionStore.getState().currentStreak >= 7,
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: 'star',
    category: 'level',
    condition: () => useProgressionStore.getState().level >= 5,
  },
  {
    id: 'level-10',
    name: 'Typing Master',
    description: 'Reach level 10',
    icon: 'military_tech',
    category: 'level',
    condition: () => useProgressionStore.getState().level >= 10,
  },
]
