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

interface SpritePosition {
  x: number
  y: number
}

const sidebarKeyPositions: Record<string, SpritePosition> = {
  '1': { x: 28, y: 10 }, '2': { x: 33, y: 10 }, '3': { x: 38, y: 10 },
  '4': { x: 43, y: 10 }, '5': { x: 48, y: 10 }, '6': { x: 55, y: 10 },
  '7': { x: 60, y: 10 }, '8': { x: 65, y: 10 }, '9': { x: 70, y: 10 },
  '0': { x: 75, y: 10 },
  'q': { x: 28, y: 28 }, 'w': { x: 33, y: 28 }, 'e': { x: 38, y: 28 },
  'r': { x: 43, y: 28 }, 't': { x: 48, y: 28 }, 'y': { x: 55, y: 28 },
  'u': { x: 60, y: 28 }, 'i': { x: 65, y: 28 }, 'o': { x: 70, y: 28 },
  'p': { x: 75, y: 28 },
  'a': { x: 28, y: 44 }, 's': { x: 33, y: 44 }, 'd': { x: 38, y: 44 },
  'f': { x: 43, y: 44 }, 'g': { x: 48, y: 44 }, 'h': { x: 55, y: 44 },
  'j': { x: 60, y: 44 }, 'k': { x: 65, y: 44 }, 'l': { x: 70, y: 44 },
  'z': { x: 30, y: 58 }, 'x': { x: 35, y: 58 }, 'c': { x: 40, y: 58 },
  'v': { x: 45, y: 58 }, 'b': { x: 55, y: 58 }, 'n': { x: 60, y: 58 },
  'm': { x: 65, y: 58 },
  ' ': { x: 50, y: 72 },
  'shift': { x: 28, y: 58 },
  'backspace': { x: 72, y: 10 },
}

function getSidebarKeySpritePath(characterId: string, key: string, hasRightKeys: boolean): string | null {
  const upper = key.toUpperCase()
  const keyMap: Record<string, string> = {
    'A': 'KeyA', 'B': 'KeyB', 'C': 'KeyC', 'D': 'KeyD', 'E': 'KeyE',
    'F': 'KeyF', 'G': 'KeyG', 'H': 'KeyH', 'I': 'KeyI', 'J': 'KeyJ',
    'K': 'KeyK', 'L': 'KeyL', 'M': 'KeyM', 'N': 'KeyN', 'O': 'KeyO',
    'P': 'KeyP', 'Q': 'KeyQ', 'R': 'KeyR', 'S': 'KeyS', 'T': 'KeyT',
    'U': 'KeyU', 'V': 'KeyV', 'W': 'KeyW', 'X': 'KeyX', 'Y': 'KeyY',
    'Z': 'KeyZ', ' ': 'Space', 'SHIFT': 'Shift', 'BACKSPACE': 'Backspace',
    '1': 'Num1', '2': 'Num2', '3': 'Num3', '4': 'Num4', '5': 'Num5',
    '6': 'Num6', '7': 'Num7', '8': 'Num8', '9': 'Num9', '0': 'Num0',
  }
  const spriteName = keyMap[upper]
  if (!spriteName) return null
  const rightHandKeys = new Set([
    'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'KeyN', 'KeyM',
    'KeyU', 'KeyI', 'KeyO', 'KeyP', 'KeyY',
    'Num7', 'Num8', 'Num9', 'Num0',
    'UpArrow', 'DownArrow', 'LeftArrow', 'RightArrow',
    'Backspace', 'Return', 'Slash', 'SemiColon', 'Quote',
    'LeftBracket', 'RightBracket', 'BackSlash', 'Comma', 'Dot', 'Minus', 'Equal',
  ])
  const side = hasRightKeys && rightHandKeys.has(spriteName) ? 'right-keys' : 'left-keys'
  return `/characters/${characterId}/${side}/${spriteName}.png`
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

  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [lastResult, setLastResult] = useState<{ wpm: number; accuracy: number; duration: number } | null>(null)
  const [handSprite, setHandSprite] = useState<string | null>(null)
  const [spritePosition, setSpritePosition] = useState<SpritePosition | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeKey = useCatStore((s) => s.activeKey)
  const characterId = useSettingsStore((s) => s.characterId)
  const character = getCharacter(characterId)

  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return sessionHistory.filter((s) => {
      const d = new Date(s.timestamp).toISOString().split('T')[0]
      return d === today
    }).length
  }, [sessionHistory])

  const todayProgress = Math.min(todaySessions / DAILY_GOAL, 1)

  useEffect(() => {
    if (status === 'complete' && sessionHistory.length > 0) {
      const latest = sessionHistory[0]
      setLastResult({ wpm: latest.wpm, accuracy: latest.accuracy, duration: latest.duration })
      setShowSessionSummary(true)
      const timer = setTimeout(() => setShowSessionSummary(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [status, sessionHistory])

  // Show hand sprite in sidebar when key is pressed
  useEffect(() => {
    if (activeKey) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      const sprite = getSidebarKeySpritePath(characterId, activeKey, character.hasRightKeys)
      if (sprite) {
        setHandSprite(sprite)
        setSpritePosition(sidebarKeyPositions[activeKey] || { x: 50, y: 50 })
      }
    }
  }, [activeKey, characterId, character.hasRightKeys])

  useEffect(() => {
    const handleKeyup = () => {
      hideTimerRef.current = setTimeout(() => {
        setHandSprite(null)
        setSpritePosition(null)
        hideTimerRef.current = null
      }, 100)
    }
    window.addEventListener('keyup', handleKeyup)
    return () => {
      window.removeEventListener('keyup', handleKeyup)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

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
      className={`fixed left-0 top-14 bottom-0 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant transition-all duration-300 z-40 ${
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

          {/* Character at Bottom with Hand Sprites */}
          <div className="p-3 border-t border-outline-variant">
            <div className="relative mx-auto w-24 h-28 flex items-center justify-center">
              <img
                src={character.cover}
                alt={character.name}
                className="w-24 h-auto select-none pointer-events-none"
                style={{
                  animation: status === 'active' ? 'catFloat 4s ease-in-out infinite' :
                             status === 'paused' ? 'none' :
                             status === 'complete' ? 'catCelebrate 0.6s ease-out' :
                             'catFloat 4s ease-in-out infinite'
                }}
                draggable={false}
              />
              {handSprite && (
                <img
                  src={handSprite}
                  alt=""
                  className="absolute w-14 h-auto pointer-events-none drop-shadow-lg"
                  style={{
                    left: `${spritePosition?.x ?? 50}%`,
                    top: `${spritePosition?.y ?? 50}%`,
                    transform: 'translate(-50%, -50%)',
                    transition: 'left 0.08s ease-out, top 0.08s ease-out',
                  }}
                  draggable={false}
                />
              )}
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
        @keyframes catFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.01); }
        }
        @keyframes catBounce {
          0% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-8px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes catCelebrate {
          0%, 100% { transform: translateY(0) rotate(0) scale(1); }
          15% { transform: translateY(-15px) rotate(-8deg) scale(1.1); }
          30% { transform: translateY(-20px) rotate(0deg) scale(1.15); }
          45% { transform: translateY(-15px) rotate(8deg) scale(1.1); }
          60% { transform: translateY(-10px) rotate(-5deg) scale(1.05); }
          75% { transform: translateY(-5px) rotate(5deg) scale(1.02); }
        }
        @keyframes handSpriteIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .hand-sprite-enter {
          animation: handSpriteIn 0.08s ease-out;
        }
      `}</style>
    </aside>
  )
}
