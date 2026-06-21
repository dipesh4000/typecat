import { create } from 'zustand'
import type { Passage, Keystroke, SessionResult } from '../shared/types'

interface TypingState {
  passage: Passage | null
  input: string
  startedAt: number | null
  pausedAt: number | null
  totalPausedTime: number
  keystrokes: Keystroke[]
  correctChars: number
  totalChars: number
  errors: number
  status: 'idle' | 'active' | 'paused' | 'complete'
  lastResult: SessionResult | null

  startSession: (passage: Passage) => void
  handleKeystroke: (char: string, expected: string, timestamp: number) => void
  handleBackspace: () => void
  endSession: () => SessionResult
  pauseSession: () => void
  resumeSession: () => void
  reset: () => void
}

let keystrokeBuffer: Keystroke[] = []

const initialState = {
  passage: null,
  input: '',
  startedAt: null,
  pausedAt: null,
  totalPausedTime: 0,
  keystrokes: [] as Keystroke[],
  correctChars: 0,
  totalChars: 0,
  errors: 0,
  status: 'idle' as const,
  lastResult: null,
}

export const useTypingStore = create<TypingState>((set, get) => ({
  ...initialState,

  startSession: (passage) => {
    keystrokeBuffer = []
    set({
      passage,
      input: '',
      startedAt: Date.now(),
      keystrokes: [],
      correctChars: 0,
      totalChars: 0,
      errors: 0,
      status: 'active',
    })
  },

  handleKeystroke: (char, expected, timestamp) => {
    const { passage, input, correctChars, totalChars, errors } = get()
    if (!passage || input.length >= passage.text.length) return

    const correct = char === expected
    keystrokeBuffer.push({ char, expected, timestamp, correct })

    set({
      input: input + char,
      correctChars: correct ? correctChars + 1 : correctChars,
      totalChars: totalChars + 1,
      errors: correct ? errors : errors + 1,
    })
  },

  handleBackspace: () => {
    const { input, correctChars, totalChars, errors } = get()
    if (input.length === 0) return

    const lastKeystroke = keystrokeBuffer[keystrokeBuffer.length - 1]
    const wasError = lastKeystroke && !lastKeystroke.correct
    keystrokeBuffer.pop()

    set({
      input: input.slice(0, -1),
      correctChars: wasError === false ? correctChars - 1 : correctChars,
      totalChars: totalChars - 1,
      errors: wasError ? errors - 1 : errors,
    })
  },

  pauseSession: () => {
    const { status } = get()
    if (status !== 'active') return
    set({ status: 'paused', pausedAt: Date.now() })
  },

  resumeSession: () => {
    const { status, pausedAt, totalPausedTime } = get()
    if (status !== 'paused' || !pausedAt) return
    const pauseDuration = Date.now() - pausedAt
    set({
      status: 'active',
      pausedAt: null,
      totalPausedTime: totalPausedTime + pauseDuration,
    })
  },

  endSession: () => {
    const { passage, startedAt, totalPausedTime, correctChars, totalChars } = get()
    if (!passage || !startedAt) {
      throw new Error('No active session')
    }

    const keystrokes = keystrokeBuffer
    keystrokeBuffer = []

    const duration = Date.now() - startedAt - totalPausedTime
    const accuracy = totalChars > 0 ? correctChars / totalChars : 0
    const elapsedMinutes = duration / 60000
    const wpm = elapsedMinutes > 0 ? (correctChars / 5) / elapsedMinutes : 0

    const timings = keystrokes.map((k) => k.timestamp)
    const intervals = timings.slice(1).map((t, i) => t - timings[i])
    const meanInterval = intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 0
    const variance = intervals.length > 0
      ? intervals.reduce((sum, interval) => sum + Math.pow(interval - meanInterval, 2), 0) / intervals.length
      : 0
    const consistency = Math.sqrt(variance)

    const result: SessionResult = {
      passageId: passage.id,
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy * 100),
      consistency: Math.round(consistency),
      totalChars,
      correctChars,
      errorChars: totalChars - correctChars,
      duration,
      timestamp: Date.now(),
      keystrokes,
    }

    set({ status: 'complete', lastResult: result, keystrokes })
    return result
  },

  reset: () => {
    keystrokeBuffer = []
    set(initialState)
  },
}))