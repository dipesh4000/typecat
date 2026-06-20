import { useMemo } from 'react'

interface TextDisplayProps {
  passage: string
  input: string
  showErrors: boolean
}

export function TextDisplay({ passage, input, showErrors }: TextDisplayProps) {
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
    <div className="font-typing-font text-xl md:text-2xl leading-relaxed select-none tracking-wide p-2">
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
  )
}
