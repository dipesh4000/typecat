import { useProgressionStore } from '../../../stores/progressionStore'

export function XPBar() {
  const xp = useProgressionStore((s) => s.xp)
  const getXPForNextLevel = useProgressionStore((s) => s.getXPForNextLevel)

  const xpForNext = getXPForNextLevel()
  const progress = (xp / xpForNext) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-on-surface-variant">XP Progress</span>
        <span className="text-xs text-on-surface-variant">
          {xp} / {xpForNext}
        </span>
      </div>
      <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}