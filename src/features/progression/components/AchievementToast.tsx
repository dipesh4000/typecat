import { useState, useEffect, useRef } from 'react'

interface AchievementToastProps {
  name: string
  description: string
  onDismiss: () => void
}

export function AchievementToast({ name, description, onDismiss }: AchievementToastProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter')
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('visible'), 300)
    const exitTimer = setTimeout(() => setPhase('exit'), 4000)
    const dismissTimer = setTimeout(() => dismissRef.current(), 4500)
    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(dismissTimer)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes toast-enter {
          from { opacity: 0; transform: translateX(-50%) translateY(50px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toast-exit {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(50px); }
        }
      `}</style>
      <div
        className="fixed bottom-8 left-1/2 bg-surface-container-low border border-outline-variant rounded-2xl px-6 py-4 shadow-lg z-50"
        style={{
          animation: phase === 'exit'
            ? 'toast-exit 0.5s ease-in forwards'
            : 'toast-enter 0.3s ease-out forwards',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
          <div>
            <p className="text-on-surface font-semibold">{name}</p>
            <p className="text-on-surface-variant text-sm">{description}</p>
          </div>
        </div>
      </div>
    </>
  )
}
