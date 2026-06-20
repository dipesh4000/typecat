import { useEffect, useState } from 'react'
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

  const character = getCharacter(characterId)
  const isTyping = animationState === 'typing' || animationState === 'focused'
  const isError = animationState === 'error'
  const isIdle = animationState === 'idle'
  const isCelebrating = animationState === 'celebrating'

  useEffect(() => {
    const msgs = stateMessages[animationState] || stateMessages.idle
    setMessage(msgs[Math.floor(Math.random() * msgs.length)])
    setShowMessage(true)
    const timer = setTimeout(() => setShowMessage(false), 2500)
    return () => clearTimeout(timer)
  }, [animationState])

  // Show hand sprite when key is pressed
  useEffect(() => {
    if (activeKey) {
      const sprite = getKeySpritePath(characterId, activeKey, character.hasRightKeys)
      if (sprite) {
        setHandSprite(sprite)
      }
      const timer = setTimeout(() => setHandSprite(null), 120)
      return () => clearTimeout(timer)
    }
  }, [activeKey, characterId, character.hasRightKeys])

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

      {/* Character Image with Hand Sprite */}
      <div
        className="relative mb-0"
        style={{
          animation: isIdle ? 'catFloat 3s ease-in-out infinite' :
                     isTyping ? 'catType 0.2s ease-in-out infinite' :
                     isError ? 'catShake 0.3s ease-in-out' :
                     isCelebrating ? 'catCelebrate 0.4s ease-in-out 3' : 'none'
        }}
      >
        <img
          src={character.cover}
          alt={character.name}
          className="w-40 h-auto select-none pointer-events-none"
          draggable={false}
        />

        {/* Hand sprite overlay — shows when typing a key */}
        {handSprite && (
          <img
            src={handSprite}
            alt=""
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-auto pointer-events-none drop-shadow-lg hand-sprite-enter"
            draggable={false}
          />
        )}

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
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes catType {
          0%, 100% { transform: translateY(0) rotate(-0.5deg); }
          50% { transform: translateY(-2px) rotate(0.5deg); }
        }
        @keyframes catShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes catCelebrate {
          0%, 100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-8px) rotate(-5deg); }
          75% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes handSpriteIn {
          from { opacity: 0; transform: translate(-50%, 10px) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        .hand-sprite-enter {
          animation: handSpriteIn 0.1s ease-out;
        }
      `}</style>
    </div>
  )
}