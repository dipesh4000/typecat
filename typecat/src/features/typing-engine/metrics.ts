import type { Keystroke } from '../../shared/types'

export function calculateWPM(correctChars: number, durationMs: number): number {
  const elapsedMinutes = durationMs / 60000
  if (elapsedMinutes <= 0) return 0
  return Math.round((correctChars / 5) / elapsedMinutes)
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 0
  return Math.round((correctChars / totalChars) * 100)
}

export function calculateConsistency(keystrokes: Keystroke[]): number {
  if (keystrokes.length < 2) return 0

  const timings = keystrokes.map((k) => k.timestamp)
  const intervals = timings.slice(1).map((t, i) => t - timings[i])

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length

  return Math.round(Math.sqrt(variance))
}