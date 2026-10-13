import { useEffect, useState } from 'react'
import { useCatStore } from '../../../stores/catStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { getCharacter, getCharacterKeySprite } from '../characters'

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

export function CatKeyboard() {
  const activeKey = useCatStore((s) => s.activeKey)
  const keyPressId = useCatStore((s) => s.keyPressId)
  const animationState = useCatStore((s) => s.animationState)
  const characterId = useSettingsStore((s) => s.characterId)

  const [hiddenMessageFor, setHiddenMessageFor] = useState('')
  const character = getCharacter(characterId)
  const keySprite = activeKey ? getCharacterKeySprite(characterId, activeKey) : null
  const isIdle = animationState === 'idle'
  const isError = animationState === 'error'
  const isCelebrating = animationState === 'celebrating'
  const isSleeping = animationState === 'sleeping'
  const message = (stateMessages[animationState] || stateMessages.idle)[0]
  const showMessage = hiddenMessageFor !== animationState

  useEffect(() => {
    const timer = setTimeout(() => setHiddenMessageFor(animationState), 2500)
    return () => clearTimeout(timer)
  }, [animationState])

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
          key={`${animationState}-${keyPressId}`}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: isIdle ? 'catFloat 4s ease-in-out infinite' :
                       activeKey ? 'catBounce 0.16s ease-out' :
                       isError ? 'catShake 0.4s ease-in-out, errorFlash 0.4s ease-in-out' :
                       isCelebrating ? 'catCelebrate 0.6s ease-out' :
                       isSleeping ? 'catSleep 4s ease-in-out infinite' : 'none'
          }}
        >
          <img
            src={character.cover}
            alt={character.name}
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
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

        {keySprite && (
          <img
            src={keySprite}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 animate-fadeIn"
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
