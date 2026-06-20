interface TextDisplayProps {
  passage: string
  input: string
  showErrors: boolean
}

export function TextDisplay({ passage, input, showErrors }: TextDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Main passage display */}
      <div
        className="font-typing-font text-2xl md:text-3xl leading-loose select-none tracking-wide"
        style={{ wordBreak: 'break-word' }}
      >
        {passage.split('').map((char, index) => {
          const isTyped = index < input.length
          const isCurrent = index === input.length
          const isCorrect = isTyped && input[index] === char
          const isError = isTyped && input[index] !== char

          if (isTyped && isCorrect) {
            return (
              <span key={index} className="text-success font-semibold">
                {char}
              </span>
            )
          }

          if (isError && showErrors) {
            return (
              <span
                key={index}
                className="relative text-error bg-error-container border-b-2 border-error font-semibold"
              >
                {char}
                {/* Show what was typed above */}
                <span className="absolute -top-5 left-0 text-xs text-error font-bold">
                  {input[index]}
                </span>
              </span>
            )
          }

          if (isCurrent) {
            return (
              <span
                key={index}
                className="relative text-on-surface font-bold border-b-3 border-primary cursor-blink"
              >
                {char}
              </span>
            )
          }

          return (
            <span key={index} className="text-on-surface-variant/40">
              {char}
            </span>
          )
        })}
      </div>

      {/* Input display - shows exactly what user typed */}
      {input.length > 0 && (
        <div className="border-t border-outline-variant pt-3">
          <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
            Your input:
          </div>
          <div className="font-typing-font text-lg bg-surface-container-low border border-outline-variant rounded-lg p-3 break-all">
            {input.split('').map((char, index) => {
              const expected = passage[index]
              const isCorrect = char === expected

              return (
                <span
                  key={index}
                  className={
                    isCorrect
                      ? 'text-success'
                      : 'text-error bg-error-container font-bold'
                  }
                >
                  {char}
                </span>
              )
            })}
            <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5" />
          </div>
        </div>
      )}
    </div>
  )
}