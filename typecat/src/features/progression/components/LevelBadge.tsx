import { useProgressionStore } from '../../../stores/progressionStore'

export function LevelBadge() {
  const level = useProgressionStore((s) => s.level)

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <span className="text-on-primary font-bold text-lg">{level}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
          Level
        </span>
        <span className="text-on-surface font-bold">{level}</span>
      </div>
    </div>
  )
}