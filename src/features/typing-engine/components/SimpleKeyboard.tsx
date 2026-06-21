import { useCatStore } from '../../../stores/catStore'

const keyboardRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ['SPACE'],
]

export function SimpleKeyboard() {
  const activeKey = useCatStore((s) => s.activeKey)

  return (
    <div className="w-full max-w-[500px] mx-auto bg-surface-container-lowest border border-outline-variant rounded-lg p-2 md:p-3 shadow-sm">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-[3px] md:gap-1 mb-[3px] md:mb-1 last:mb-0">
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
                  flex items-center justify-center font-mono text-[8px] md:text-[10px] font-semibold
                  border rounded transition-all duration-75
                  ${isActive
                    ? 'bg-primary text-on-primary scale-95 border-primary'
                    : 'bg-surface-container-low text-on-surface border-outline-variant'
                  }
                  ${isWide ? 'w-8 md:w-10 h-6 md:h-7' : isSpace ? 'w-20 md:w-32 h-6 md:h-7' : 'w-6 md:w-7 h-6 md:h-7'}
                `}
              >
                {key}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
