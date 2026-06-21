import { useProgressionStore } from '../../stores/progressionStore'
import { achievementDefs } from '../../shared/achievements'
import { motion } from 'framer-motion'

const categoryLabels: Record<string, string> = {
  speed: 'Speed',
  accuracy: 'Accuracy',
  streak: 'Streak',
  level: 'Level',
}

const categoryOrder = ['speed', 'accuracy', 'streak', 'level']

export default function AchievementsPage() {
  const unlockedAchievements = useProgressionStore((s) => s.unlockedAchievements)
  const currentStreak = useProgressionStore((s) => s.currentStreak)
  const longestStreak = useProgressionStore((s) => s.longestStreak)
  const xp = useProgressionStore((s) => s.xp)
  const level = useProgressionStore((s) => s.level)
  const getXPForNextLevel = useProgressionStore((s) => s.getXPForNextLevel)

  const xpForNext = getXPForNextLevel()
  const xpProgress = (xp / xpForNext) * 100

  const unlockedIds = new Set(unlockedAchievements.map((a) => a.id))
  const totalAchievements = achievementDefs.length
  const totalUnlocked = unlockedAchievements.length
  const overallProgress = (totalUnlocked / totalAchievements) * 100

  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    achievements: achievementDefs.filter((a) => a.category === cat),
  }))

  return (
    <div className="w-full">
      {/* Level Card */}
      <div className="bg-surface-container-lowest border border-outline-variant p-4 md:p-6 rounded-lg mb-4 md:mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
              <span className="text-lg md:text-2xl font-bold">{level}</span>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-primary">Level {level}</h2>
              <p className="text-[10px] md:text-xs text-on-surface-variant">
                {xp} / {xpForNext} XP to next level
              </p>
            </div>
          </div>
          <div className="w-24 md:w-48 shrink-0">
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
        <div className="bg-surface-container-low border border-outline-variant p-3 md:p-6 rounded-lg">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <span className="material-symbols-outlined text-primary text-lg md:text-xl">local_fire_department</span>
            <h3 className="text-xs md:text-sm font-bold text-primary">Current Streak</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-primary">{currentStreak} days</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant p-3 md:p-6 rounded-lg">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <span className="material-symbols-outlined text-primary text-lg md:text-xl">emoji_events</span>
            <h3 className="text-xs md:text-sm font-bold text-primary">Longest Streak</h3>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-primary">{longestStreak} days</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-bold text-primary">Achievements</h3>
        <span className="text-xs md:text-sm text-on-surface-variant">
          {totalUnlocked} / {totalAchievements} unlocked
        </span>
      </div>
      <div className="h-2 bg-surface-container rounded-full overflow-hidden mb-4 md:mb-6">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {grouped.map(({ category, label, achievements }) => (
        <div key={category} className="mb-4 md:mb-6">
          <h4 className="text-xs md:text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2 md:mb-3">
            {label}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id)
              const unlockedRecord = unlockedAchievements.find((a) => a.id === achievement.id)
              const unlockedDate = unlockedRecord?.unlockedAt
                ? new Date(unlockedRecord.unlockedAt).toLocaleDateString()
                : null

              return (
                <motion.div
                  key={achievement.id}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-surface-container-lowest border rounded-lg transition-all cursor-pointer ${
                    isUnlocked
                      ? 'border-primary ring-2 ring-primary ring-opacity-10'
                      : 'border-outline-variant opacity-60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    isUnlocked ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-lg md:text-xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-bold">{achievement.name}</p>
                    <p className="text-[10px] md:text-xs text-on-surface-variant">{achievement.description}</p>
                    {isUnlocked && unlockedDate && (
                      <p className="text-[10px] md:text-xs text-primary mt-0.5 md:mt-1">Unlocked {unlockedDate}</p>
                    )}
                    {!isUnlocked && (
                      <div className="mt-1.5 md:mt-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-outline-variant rounded-full" style={{ width: '0%' }} />
                      </div>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant shrink-0">
                    {isUnlocked ? 'check_circle' : 'lock'}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
