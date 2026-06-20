import { useState, useEffect } from 'react'
import { useStatsStore } from '../stores/statsStore'
import { useProgressionStore } from '../stores/progressionStore'
import { useCatStore } from '../stores/catStore'
import { useSettingsStore } from '../stores/settingsStore'
import { getCharacter } from '../features/cat-companion/characters'

const stateMessages: Record<string, string> = {
  idle: '"Ready to type?"',
  typing: '"Bongo bongo!"',
  error: '"Oops!"',
  celebrating: '"Great job!"',
  sleeping: '"Zzz..."',
  focused: '"In the zone!"',
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const bestWPM = useStatsStore((s) => s.bestWPM)
  const getAverageAccuracy = useStatsStore((s) => s.getAverageAccuracy)
  const currentStreak = useProgressionStore((s) => s.currentStreak)
  const level = useProgressionStore((s) => s.level)
  const animationState = useCatStore((s) => s.animationState)
  const activeKey = useCatStore((s) => s.activeKey)
  const characterId = useSettingsStore((s) => s.characterId)

  const character = getCharacter(characterId)
  const [pawSprite, setPawSprite] = useState<string | null>(null)

  // Map keyboard keys to sprite filenames
  const getKeySprite = (key: string): string | null => {
    const upper = key.toUpperCase()
    const map: Record<string, string> = {
      'A': 'KeyA', 'B': 'KeyB', 'C': 'KeyC', 'D': 'KeyD', 'E': 'KeyE',
      'F': 'KeyF', 'G': 'KeyG', 'H': 'KeyH', 'I': 'KeyI', 'J': 'KeyJ',
      'K': 'KeyK', 'L': 'KeyL', 'M': 'KeyM', 'N': 'KeyN', 'O': 'KeyO',
      'P': 'KeyP', 'Q': 'KeyQ', 'R': 'KeyR', 'S': 'KeyS', 'T': 'KeyT',
      'U': 'KeyU', 'V': 'KeyV', 'W': 'KeyW', 'X': 'KeyX', 'Y': 'KeyY',
      'Z': 'KeyZ', ' ': 'Space', 'SHIFT': 'Shift', 'BACKSPACE': 'Backspace',
      '1': 'Num1', '2': 'Num2', '3': 'Num3', '4': 'Num4', '5': 'Num5',
      '6': 'Num6', '7': 'Num7', '8': 'Num8', '9': 'Num9', '0': 'Num0',
    }
    const spriteName = map[upper]
    if (!spriteName) return null

    const rightHandKeys = new Set([
      'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'KeyN', 'KeyM',
      'KeyU', 'KeyI', 'KeyO', 'KeyP', 'KeyY',
      'Num7', 'Num8', 'Num9', 'Num0',
      'UpArrow', 'DownArrow', 'LeftArrow', 'RightArrow',
      'Backspace', 'Return', 'Slash', 'SemiColon', 'Quote',
    ])

    const side = character.hasRightKeys && rightHandKeys.has(spriteName) ? 'right-keys' : 'left-keys'
    return `/characters/${characterId}/${side}/${spriteName}.png`
  }

  // Show paw sprite when key is pressed
  useEffect(() => {
    if (activeKey) {
      const sprite = getKeySprite(activeKey)
      if (sprite) {
        setPawSprite(sprite)
      }
      const timer = setTimeout(() => setPawSprite(null), 150)
      return () => clearTimeout(timer)
    }
  }, [activeKey, characterId])

  const isError = animationState === 'error'

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 w-6 h-6 bg-surface border border-outline-variant rounded-full flex items-center justify-center shadow-sm hover:bg-surface-container-high transition-colors z-50"
      >
        <span className="material-symbols-outlined text-xs" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
          chevron_left
        </span>
      </button>

      {collapsed ? (
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
            <img src={character.cover} alt={character.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-center gap-1 text-[10px] text-on-surface-variant">
            <span className="font-bold text-primary">{bestWPM}</span>
            <span>WPM</span>
          </div>
        </div>
      ) : (
        <>
          <div className="p-stack-md">
            <h2 className="text-lg font-bold text-primary mb-1">Live Stats</h2>
            <p className="text-xs text-on-surface-variant">Lifetime Stats</p>
          </div>

          <div className="flex flex-col gap-2 px-stack-md">
            <div className="flex items-center gap-3 p-3 bg-secondary-container text-on-secondary-container rounded-lg">
              <span className="material-symbols-outlined">speed</span>
              <div className="flex flex-col">
                <span className="text-xs uppercase opacity-70">WPM</span>
                <span className="text-sm font-bold">{bestWPM}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
              <span className="material-symbols-outlined">target</span>
              <div className="flex flex-col">
                <span className="text-xs uppercase opacity-70">Accuracy</span>
                <span className="text-sm font-bold">{getAverageAccuracy()}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
              <span className="material-symbols-outlined">local_fire_department</span>
              <div className="flex flex-col">
                <span className="text-xs uppercase opacity-70">Streak</span>
                <span className="text-sm font-bold">{currentStreak} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all">
              <span className="material-symbols-outlined">star</span>
              <div className="flex flex-col">
                <span className="text-xs uppercase opacity-70">Level</span>
                <span className="text-sm font-bold">{level}</span>
              </div>
            </div>
          </div>

          {/* Character with Live Typing */}
          <div className="mt-auto p-stack-md border-t border-outline-variant">
            <div className="relative overflow-hidden rounded-lg">
              {/* Character image */}
              <img
                src={character.cover}
                alt={character.name}
                className="w-full h-auto"
                draggable={false}
              />

              {/* Paw/hand sprite overlay — appears when typing */}
              {pawSprite && (
                <img
                  src={pawSprite}
                  alt=""
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-auto pointer-events-none drop-shadow-lg"
                  draggable={false}
                />
              )}

              {/* Error sweat */}
              {isError && (
                <div className="absolute top-2 right-2 text-blue-400 text-sm animate-pulse">💧</div>
              )}

              {/* Celebration sparkles */}
              {animationState === 'celebrating' && (
                <>
                  <div className="absolute top-1 left-2 text-yellow-400 text-xs animate-bounce">✨</div>
                  <div className="absolute top-1 right-2 text-yellow-400 text-xs animate-bounce" style={{ animationDelay: '0.1s' }}>✨</div>
                </>
              )}
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs font-bold text-primary">{character.name}</p>
              <p className="text-[10px] text-on-surface-variant">
                {stateMessages[animationState] || stateMessages.idle}
              </p>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}