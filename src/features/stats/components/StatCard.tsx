import type { SessionResult } from '../../../shared/types'

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4 shadow-sm">
      <p className="text-on-surface-variant text-sm font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-on-surface text-2xl font-bold">{value}</span>
        {unit && <span className="text-on-surface-variant text-sm">{unit}</span>}
      </div>
    </div>
  )
}

interface WPMChartProps {
  sessions: SessionResult[]
}

export function WPMChart({ sessions }: WPMChartProps) {
  const maxWPM = Math.max(...sessions.map((s) => s.wpm), 100)

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 shadow-sm">
      <p className="text-on-surface-variant text-sm font-medium mb-4">WPM History</p>
      <div className="flex items-end gap-1 h-32">
        {sessions.slice(0, 20).reverse().map((session, index) => (
          <div
            key={index}
            className="flex-1 bg-primary/20 rounded-t-sm transition-all duration-300"
            style={{ height: `${(session.wpm / maxWPM) * 100}%` }}
            title={`${session.wpm} WPM`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
        <span>Oldest</span>
        <span>Recent</span>
      </div>
    </div>
  )
}

interface SessionHistoryProps {
  sessions: SessionResult[]
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4 shadow-sm">
      <p className="text-on-surface-variant text-sm font-medium mb-4">Recent Sessions</p>
      <div className="space-y-2">
        {sessions.slice(0, 10).map((session, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-on-surface font-semibold">{session.wpm} WPM</span>
              <span className="text-on-surface-variant text-sm">{session.accuracy}%</span>
            </div>
            <span className="text-on-surface-variant text-xs">
              {new Date(session.timestamp).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}