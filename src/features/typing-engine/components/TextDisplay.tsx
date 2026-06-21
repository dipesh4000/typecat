import { useMemo } from 'react'

interface TextDisplayProps {
  passage: string
  input: string
  showErrors: boolean
  liveWPM?: number
  liveAccuracy?: number
}

export function TextDisplay({ passage, input, showErrors, liveWPM = 0, liveAccuracy = 100 }: TextDisplayProps) {
  const chars = useMemo(() => {
    return passage.split('').map((char, index) => {
      const isTyped = index < input.length
      const isCurrent = index === input.length
      const isCorrect = isTyped && input[index] === char
      const isError = isTyped && input[index] !== char

      return { char, index, isTyped, isCurrent, isCorrect, isError }
    })
  }, [passage, input])

  return (
    <div className="h-full flex flex-col">
      {/* Live Stats Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/50 mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-primary">speed</span>
            <span className="text-sm font-bold text-primary">{liveWPM}</span>
            <span className="text-[10px] text-on-surface-variant">WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-success">target</span>
            <span className="text-sm font-bold text-success">{liveAccuracy}%</span>
          </div>
        </div>
        <div className="text-[10px] text-on-surface-variant">
          {input.length}/{passage.length}
        </div>
      </div>

      {/* Passage Display */}
      <div className="flex-1 overflow-y-auto px-1">
        <div
          className="font-typing-font text-lg md:text-xl leading-loose select-none tracking-wide"
          style={{ wordBreak: 'break-word' }}
        >
          {chars.map(({ char, index, isTyped, isCurrent, isCorrect, isError }) => {
            if (isCorrect) {
              return (
                <span key={index} className="text-success font-medium">
                  {char}
                </span>
              )
            }

            if (isError && showErrors) {
              return (
                <span
                  key={index}
                  className="relative text-error bg-error-container/50 font-medium"
                >
                  {char}
                </span>
              )
            }

            if (isCurrent) {
              return (
                <span
                  key={index}
                  className="relative text-on-surface font-bold"
                  id="current-char"
                >
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full animate-pulse" />
                  {char}
                </span>
              )
            }

            if (isTyped) {
              return (
                <span key={index} className="text-on-surface/60">
                  {char}
                </span>
              )
            }

            return (
              <span key={index} className="text-on-surface-variant/30">
                {char}
              </span>
            )
          })}
        </div>
      </div>

      {/* Typed Input Preview */}
      {input.length > 0 && (
        <div className="mt-3 pt-3 border-t border-outline-variant/50">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-[12px] text-on-surface-variant">keyboard</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Your input</span>
          </div>
          <div className="font-typing-font text-sm bg-surface-container-low border border-outline-variant/50 rounded-lg p-2.5 max-h-20 overflow-y-auto break-all leading-relaxed">
            {input.split('').map((char, index) => {
              const expected = passage[index]
              const isCorrect = char === expected

              return (
                <span
                  key={index}
                  className={
                    isCorrect
                      ? 'text-success'
                      : 'text-error bg-error-container/30 rounded-sm px-0.5'
                  }
                >
                  {char}
                </span>
              )
            })}
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
          </div>
        </div>
      )}
    </div>
  )
}
