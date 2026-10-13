import { useState, useEffect, useMemo, useRef } from 'react'
import { useStatsStore } from '../stores/statsStore'
import { useProgressionStore } from '../stores/progressionStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useTypingStore } from '../stores/typingStore'
import { useCatStore } from '../stores/catStore'
import { getCharacter } from '../features/cat-companion/characters'

const DAILY_GOAL = 5

interface SidebarProps {
  collapsed: boolean
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 48
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-surface-container-highest)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  )
}

export function Sidebar({ collapsed }: SidebarProps) {
  const bestWPM = useStatsStore((s) => s.bestWPM)
  const getAverageAccuracy = useStatsStore((s) => s.getAverageAccuracy)
  const sessionHistory = useStatsStore((s) => s.sessionHistory)
  const currentStreak = useProgressionStore((s) => s.currentStreak)
  const level = useProgressionStore((s) => s.level)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const toggleSound = useSettingsStore((s) => s.toggleSound)
  const status = useTypingStore((s) => s.status)

  const [hiddenSummary, setHiddenSummary] = useState<number | null>(null)
  const activeKey = useCatStore((s) => s.activeKey)
  const keyPressId = useCatStore((s) => s.keyPressId)
  const animationState = useCatStore((s) => s.animationState)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)
  const characterRef = useRef<HTMLDivElement>(null)
  const characterId = useSettingsStore((s) => s.characterId)
  const character = getCharacter(characterId)

  useEffect(() => {
    if (!activeKey || status !== 'active' || reducedMotion || !characterRef.current) return
    const hand = 'yuiophjklnm67890'.includes(activeKey) ? 1 : -1
    characterRef.current.animate([
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: `translateY(3px) rotate(${hand * 2}deg)`, offset: 0.38 },
      { transform: 'translateY(0) rotate(0deg)' },
    ], { duration: 190, easing: 'ease-out' })
  }, [keyPressId, activeKey, status, reducedMotion])

  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return sessionHistory.filter((s) => {
      const d = new Date(s.timestamp).toISOString().split('T')[0]
      return d === today
    }).length
  }, [sessionHistory])

  const todayProgress = Math.min(todaySessions / DAILY_GOAL, 1)

  const lastResult = sessionHistory[0] ?? null
  const showSessionSummary = status === 'complete' && lastResult !== null && hiddenSummary !== lastResult.timestamp
  useEffect(() => {
    if (!showSessionSummary || !lastResult) return
    const timer = setTimeout(() => setHiddenSummary(lastResult.timestamp), 5000)
    return () => clearTimeout(timer)
  }, [showSessionSummary, lastResult])

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  const themeIcon = theme === 'light' ? 'light_mode' : theme === 'dark' ? 'dark_mode' : 'brightness_auto'
  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000)
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >

      {collapsed ? (
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="flex flex-col items-center gap-1 text-[10px] text-on-surface-variant">
            <span className="font-bold text-primary">{bestWPM}</span>
            <span>WPM</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-[10px] text-on-surface-variant">
            <div className="relative">
              <ProgressRing progress={todayProgress} />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary">
                {todaySessions}
              </span>
            </div>
            <span>Today</span>
          </div>
          {/* Collapsed character at bottom */}
          <div className="mt-auto pb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline-variant">
              <img src={character.cover} alt={character.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Progress */}
          <div className="p-4 pb-3 border-b border-outline-variant">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Today</span>
              <span className="text-xs text-on-surface-variant">{todaySessions}/{DAILY_GOAL}</span>
            </div>
            <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${todayProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Live Stats */}
          <div className="p-4 pb-3 border-b border-outline-variant">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Stats</span>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex flex-col items-center p-2 bg-secondary-container text-on-secondary-container rounded-lg">
                <span className="material-symbols-outlined text-sm mb-0.5">speed</span>
                <span className="text-base font-bold leading-tight">{bestWPM}</span>
                <span className="text-[10px] uppercase opacity-70">WPM</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-surface-container-high rounded-lg">
                <span className="material-symbols-outlined text-sm mb-0.5 text-on-surface-variant">target</span>
                <span className="text-base font-bold leading-tight text-on-surface">{getAverageAccuracy()}%</span>
                <span className="text-[10px] uppercase opacity-70 text-on-surface-variant">Accuracy</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-surface-container-high rounded-lg">
                <span className="material-symbols-outlined text-sm mb-0.5 text-on-surface-variant">local_fire_department</span>
                <span className="text-base font-bold leading-tight text-on-surface">{currentStreak}</span>
                <span className="text-[10px] uppercase opacity-70 text-on-surface-variant">Streak</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-surface-container-high rounded-lg">
                <span className="material-symbols-outlined text-sm mb-0.5 text-on-surface-variant">star</span>
                <span className="text-base font-bold leading-tight text-on-surface">{level}</span>
                <span className="text-[10px] uppercase opacity-70 text-on-surface-variant">Level</span>
              </div>
            </div>
          </div>

          {/* Session Summary (shown briefly after completion) */}
          {showSessionSummary && lastResult && (
            <div className="px-4 py-3 border-b border-outline-variant bg-success-container/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm text-success">check_circle</span>
                <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">Session Complete</span>
              </div>
              <div className="flex gap-3 text-center">
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">{lastResult.wpm}</p>
                  <p className="text-[10px] text-on-surface-variant">WPM</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">{lastResult.accuracy}%</p>
                  <p className="text-[10px] text-on-surface-variant">Acc</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">{formatDuration(lastResult.duration)}</p>
                  <p className="text-[10px] text-on-surface-variant">Time</p>
                </div>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Character at Bottom */}
          <div className="p-3 border-t border-outline-variant">
            <div className="relative mx-auto w-full h-28 overflow-hidden">
              <div
                ref={characterRef}
                className="absolute inset-0 flex items-center justify-center origin-bottom"
                style={{
                  animation: reducedMotion ? 'none' :
                             status === 'complete' ? 'sidebarCelebrate 0.7s ease-out' :
                             animationState === 'error' ? 'sidebarOops 0.35s ease-out' :
                             status === 'paused' ? 'none' : 'sidebarBreathe 3.8s ease-in-out infinite'
                }}
              >
                <img
                  src={character.cover}
                  alt={character.name}
                  className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                  draggable={false}
                />
              </div>
              {activeKey && status === 'active' && <span className="absolute right-1 top-0 rounded-md border border-outline-variant bg-surface-container-lowest/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary shadow-sm" aria-label={`Pressed ${activeKey === ' ' ? 'space' : activeKey}`}>{activeKey === ' ' ? 'SPACE' : activeKey.toUpperCase()}</span>}
            </div>
            <p className="text-center text-[10px] font-medium text-on-surface-variant mt-1">{character.name}</p>
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-outline-variant">
            <div className="flex gap-2">
              <button
                onClick={cycleTheme}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-sm">{themeIcon}</span>
                {themeLabel}
              </button>
              <button
                onClick={toggleSound}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
                {soundEnabled ? 'Sound' : 'Muted'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes sidebarBreathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes sidebarOops { 0%, 100% { transform: rotate(0); } 30% { transform: rotate(-3deg); } 65% { transform: rotate(2deg); } }
        @keyframes sidebarCelebrate { 0%, 100% { transform: translateY(0) rotate(0); } 35% { transform: translateY(-7px) rotate(-3deg); } 65% { transform: translateY(-4px) rotate(3deg); } }
      `}</style>
    </aside>
  )
}
