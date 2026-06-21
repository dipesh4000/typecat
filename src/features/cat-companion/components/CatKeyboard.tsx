import { useEffect, useState, useRef } from 'react'
import { useCatStore } from '../../../stores/catStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { getCharacter } from '../characters'

const keyboardRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ['SPACE'],
]

const stateMessages: Record<string, string[]> = {
  idle: ['Ready to type?', 'Let\'s go!', 'Pick a passage!'],
  typing: ['Keep going!', 'Nice!', 'You\'re doing great!', 'Bongo bongo!'],
  error: ['Oops!', 'Try again!', 'Watch the text!'],
  celebrating: ['Amazing!', 'Purr-fect!', 'Well done!'],
  sleeping: ['Zzz...', '*purrs*'],
  focused: ['In the zone!', 'Flow state!'],
}

interface SpritePosition {
  x: number
  y: number
}

const keyPositions: Record<string, SpritePosition> = {
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

function getKeySpritePath(characterId: string, key: string, hasRightKeys: boolean): string | null {
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

  // Right hand covers right side of keyboard (H-L, U-P, 7-0, arrows)
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

export function CatKeyboard() {
  const activeKey = useCatStore((s) => s.activeKey)
  const animationState = useCatStore((s) => s.animationState)
  const characterId = useSettingsStore((s) => s.characterId)

  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [handSprite, setHandSprite] = useState<string | null>(null)
  const [spritePosition, setSpritePosition] = useState<SpritePosition | null>(null)
  const [isTypingBounce, setIsTypingBounce] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const character = getCharacter(characterId)
  const isIdle = animationState === 'idle'
  const isError = animationState === 'error'
  const isCelebrating = animationState === 'celebrating'
  const isSleeping = animationState === 'sleeping'

  useEffect(() => {
    const msgs = stateMessages[animationState] || stateMessages.idle
    setMessage(msgs[Math.floor(Math.random() * msgs.length)])
    setShowMessage(true)
    const timer = setTimeout(() => setShowMessage(false), 2500)
    return () => clearTimeout(timer)
  }, [animationState])

  // Trigger bounce on each keystroke (not continuous)
  useEffect(() => {
    if (activeKey && animationState !== 'error' && animationState !== 'celebrating') {
      setIsTypingBounce(true)
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current)
      bounceTimerRef.current = setTimeout(() => setIsTypingBounce(false), 200)
    }
    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current)
    }
  }, [activeKey, animationState])

  // Show hand sprite immediately on keydown at the key's position
  useEffect(() => {
    if (activeKey) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      const sprite = getKeySpritePath(characterId, activeKey, character.hasRightKeys)
      if (sprite) {
        setHandSprite(sprite)
        setSpritePosition(keyPositions[activeKey] || { x: 50, y: 50 })
      }
    }
  }, [activeKey, characterId, character.hasRightKeys])

  // Hide sprite 100ms after keyup (not fixed timeout from keydown)
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* Speech Bubble */}
      <div className="h-6 flex items-center justify-center mb-0.5">
        {showMessage && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-0.5 text-[10px] font-medium text-on-surface shadow-sm animate-fadeIn">
            {message}
          </div>
        )}
      </div>

      {/* Character + Hand Sprite container (not animated itself) */}
      <div className="relative mb-0 w-40 h-44">
        {/* Character Image (animated separately) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: isIdle ? 'catFloat 4s ease-in-out infinite' :
                       isTypingBounce ? 'catBounce 0.2s ease-out' :
                       isError ? 'catShake 0.4s ease-in-out, errorFlash 0.4s ease-in-out' :
                       isCelebrating ? 'catCelebrate 0.6s ease-out' :
                       isSleeping ? 'catSleep 4s ease-in-out infinite' : 'none'
          }}
        >
          <img
            src={character.cover}
            alt={character.name}
            className="w-40 h-auto select-none pointer-events-none"
            draggable={false}
          />
          {isError && (
            <div className="absolute top-1 right-2 text-blue-400 text-xs animate-pulse">💧</div>
          )}
          {isCelebrating && (
            <>
              <div className="absolute -top-1 left-6 text-yellow-400 text-xs animate-bounce">✨</div>
              <div className="absolute -top-1 right-6 text-yellow-400 text-xs animate-bounce" style={{ animationDelay: '0.15s' }}>✨</div>
            </>
          )}
        </div>

        {/* Hand sprite overlay — NOT inside animated container, positioned per key */}
        {handSprite && (
          <img
            src={handSprite}
            alt=""
            className="absolute w-20 h-auto pointer-events-none drop-shadow-lg z-10"
            style={{
              left: `${spritePosition?.x ?? 50}%`,
              top: `${spritePosition?.y ?? 50}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.06s ease-out, top 0.06s ease-out',
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-[500px] bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-3 shadow-md">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 mb-1 last:mb-0">
            {row.map((key) => {
              const keyId = key === 'SHIFT' ? 'shift' :
                           key === '⌫' ? 'backspace' :
                           key === 'SPACE' ? ' ' :
                           key.toLowerCase()
              const isActive = activeKey === keyId ||
                              (key === 'SHIFT' && activeKey === 'shift') ||
                              (key === '⌫' && activeKey === 'backspace') ||
                              (key === 'SPACE' && activeKey === ' ')
              const isWide = key === 'SHIFT' || key === '⌫'
              const isSpace = key === 'SPACE'

              return (
                <div
                  key={key}
                  className={`
                    flex items-center justify-center font-mono text-[10px] font-bold
                    border-2 border-outline-variant rounded transition-all duration-75
                    ${isActive ? 'bg-primary text-on-primary scale-95' : 'bg-surface-container text-on-surface'}
                    ${isWide ? 'w-10 h-7' : isSpace ? 'w-32 h-7' : 'w-7 h-7'}
                  `}
                >
                  {key}
                </div>
              )
            })}
          </div>
        ))}
      </div>

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
        @keyframes catShake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10% { transform: translateX(-6px) rotate(-3deg); }
          20% { transform: translateX(6px) rotate(3deg); }
          30% { transform: translateX(-5px) rotate(-2deg); }
          40% { transform: translateX(5px) rotate(2deg); }
          50% { transform: translateX(-3px) rotate(-1deg); }
          60% { transform: translateX(3px) rotate(1deg); }
        }
        @keyframes catCelebrate {
          0%, 100% { transform: translateY(0) rotate(0) scale(1); }
          15% { transform: translateY(-15px) rotate(-8deg) scale(1.1); }
          30% { transform: translateY(-20px) rotate(0deg) scale(1.15); }
          45% { transform: translateY(-15px) rotate(8deg) scale(1.1); }
          60% { transform: translateY(-10px) rotate(-5deg) scale(1.05); }
          75% { transform: translateY(-5px) rotate(5deg) scale(1.02); }
        }
        @keyframes catSleep {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(2px) rotate(2deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes errorFlash {
          0% { filter: brightness(1); }
          25% { filter: brightness(1.3) hue-rotate(-10deg); }
          50% { filter: brightness(0.9) hue-rotate(10deg); }
          75% { filter: brightness(1.2) hue-rotate(-5deg); }
          100% { filter: brightness(1); }
        }
      `}</style>
    </div>
  )
}