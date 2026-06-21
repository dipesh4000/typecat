import { useStatsStore } from '../../stores/statsStore'
import { useProgressionStore } from '../../stores/progressionStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { WPMChart, SessionHistory } from '../../features/stats/components/StatCard'
import { motion } from 'framer-motion'

const catEmojis: Record<number, string> = {
  1: '🐱',
  2: '😺',
  3: '😸',
  4: '😹',
  5: '😻',
}

const categoryLabels: Record<string, string> = {
  all: 'All Categories',
  english: 'English',
  anime: 'Anime',
  programming: 'Programming',
}

export default function StatsPage() {
  const bestWPM = useStatsStore((s) => s.bestWPM)
  const totalWordsTyped = useStatsStore((s) => s.totalWordsTyped)
  const totalSessionsCompleted = useStatsStore((s) => s.totalSessionsCompleted)
  const getAverageWPM = useStatsStore((s) => s.getAverageWPM)
  const getAverageAccuracy = useStatsStore((s) => s.getAverageAccuracy)
  const getRecentSessions = useStatsStore((s) => s.getRecentSessions)
  const xp = useProgressionStore((s) => s.xp)
  const level = useProgressionStore((s) => s.level)
  const getXPForNextLevel = useProgressionStore((s) => s.getXPForNextLevel)
  const getXPProgress = useProgressionStore((s) => s.getXPProgress)
  const category = useSettingsStore((s) => s.category)

  const last10Sessions = getRecentSessions(10)
  const last5Sessions = getRecentSessions(5)
  const xpProgress = Math.round(getXPProgress() * 100)

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Hero Card */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant p-4 md:p-8 rounded-lg relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-on-primary rounded-full mb-3 md:mb-6">
                <span className="material-symbols-outlined text-[14px]">keyboard</span>
                <span className="text-xs uppercase font-semibold">Current Module</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 md:mb-4">{categoryLabels[category]}</h1>
              <p className="text-on-surface-variant max-w-md mb-4 md:mb-8 text-sm md:text-base">
                {totalSessionsCompleted > 0
                  ? `You've completed ${totalSessionsCompleted} sessions. Keep up the great work!`
                  : 'Start typing to build your stats. Every session counts toward your progress.'}
              </p>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant">Sessions Completed</span>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-lg md:text-xl font-bold text-primary">{totalSessionsCompleted}</span>
                  <span className="text-xs text-on-surface-variant">total</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant">Words Typed</span>
                <span className="text-lg md:text-xl font-bold text-primary">{totalWordsTyped}</span>
              </div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[80px] md:text-[160px]">terminal</span>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="md:col-span-4 bg-surface-container-low border border-outline-variant p-4 md:p-6 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 md:mb-4 flex items-center justify-between">
              Lifetime Bests
              <span className="material-symbols-outlined text-primary">military_tech</span>
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <span className="text-on-surface-variant text-sm">Max Speed</span>
                <span className="typing-font text-primary">{bestWPM} <small className="text-xs">WPM</small></span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <span className="text-on-surface-variant text-sm">Avg Accuracy</span>
                <span className="typing-font text-primary">{getAverageAccuracy()} <small className="text-xs">%</small></span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <span className="text-on-surface-variant text-sm">Total Words</span>
                <span className="typing-font text-primary">{totalWordsTyped}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <span className="text-lg md:text-[20px] font-bold">{level}</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Current Level</p>
                <p className="text-sm font-bold">Level {level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* WPM Chart */}
        {last10Sessions.length > 0 && (
          <div className="md:col-span-8">
            <WPMChart sessions={last10Sessions} />
          </div>
        )}

        {/* Session History */}
        {last5Sessions.length > 0 && (
          <div className="md:col-span-4">
            <SessionHistory sessions={last5Sessions} />
          </div>
        )}

        {/* Empty state */}
        {last10Sessions.length === 0 && (
          <div className="md:col-span-12 bg-surface-container-low border border-outline-variant p-6 md:p-8 rounded-lg text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">bar_chart</span>
            <h3 className="text-lg font-bold text-on-surface mb-2">No sessions yet</h3>
            <p className="text-on-surface-variant text-sm">Complete your first typing session to see your WPM history and stats here.</p>
          </div>
        )}

        {/* Reward Cards */}
        <div className="md:col-span-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-secondary-container rounded-lg p-4 md:p-6 flex flex-col items-center text-center relative overflow-hidden group border border-outline-variant">
              <motion.div
                className="text-5xl md:text-6xl relative z-10 mb-3 md:mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {catEmojis[level] || '🐱'}
              </motion.div>
              <h5 className="text-sm font-bold text-on-secondary-container relative z-10">Level {level}</h5>
              <p className="text-xs text-on-secondary-container opacity-80 mb-2 relative z-10">
                {xp} / {getXPForNextLevel()} XP
              </p>
              <div className="w-full h-2 bg-on-secondary-container/20 rounded-full overflow-hidden relative z-10">
                <div
                  className="h-full bg-on-secondary-container transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-4 md:p-6 rounded-lg">
              <h5 className="text-sm font-bold text-primary mb-3">Session Stats</h5>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Avg WPM</span>
                  <span className="text-xs font-bold text-primary">{getAverageWPM()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Avg Accuracy</span>
                  <span className="text-xs font-bold text-primary">{getAverageAccuracy()}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Total Sessions</span>
                  <span className="text-xs font-bold text-primary">{totalSessionsCompleted}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-4 md:p-6 rounded-lg">
              <h5 className="text-sm font-bold text-primary mb-3">Progress</h5>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Total Words</span>
                  <span className="text-xs font-bold text-primary">{totalWordsTyped}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Best WPM</span>
                  <span className="text-xs font-bold text-primary">{bestWPM}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">XP Earned</span>
                  <span className="text-xs font-bold text-primary">{xp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
