import { describe, it, expect, beforeEach } from 'vitest'
import { useTypingStore } from './typingStore'
import type { Passage } from '../shared/types'

const testPassage: Passage = {
  id: 'test-001',
  category: 'english',
  difficulty: 'easy',
  text: 'hello',
}

describe('typingStore', () => {
  beforeEach(() => {
    useTypingStore.getState().reset()
  })

  describe('startSession', () => {
    it('sets passage and status to active', () => {
      useTypingStore.getState().startSession(testPassage)
      const state = useTypingStore.getState()
      expect(state.passage).toBe(testPassage)
      expect(state.status).toBe('active')
      expect(state.input).toBe('')
      expect(state.correctChars).toBe(0)
      expect(state.totalChars).toBe(0)
    })
  })

  describe('handleKeystroke', () => {
    it('records correct keystroke', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleKeystroke('h', 'h', 100)
      const state = useTypingStore.getState()
      expect(state.input).toBe('h')
      expect(state.correctChars).toBe(1)
      expect(state.totalChars).toBe(1)
      expect(state.errors).toBe(0)
    })

    it('records incorrect keystroke', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleKeystroke('x', 'h', 100)
      const state = useTypingStore.getState()
      expect(state.input).toBe('x')
      expect(state.correctChars).toBe(0)
      expect(state.totalChars).toBe(1)
      expect(state.errors).toBe(1)
    })

    it('does not record beyond passage length', () => {
      useTypingStore.getState().startSession({ ...testPassage, text: 'hi' })
      useTypingStore.getState().handleKeystroke('h', 'h', 100)
      useTypingStore.getState().handleKeystroke('i', 'i', 200)
      useTypingStore.getState().handleKeystroke('!', '!', 300)
      expect(useTypingStore.getState().input).toBe('hi')
      expect(useTypingStore.getState().totalChars).toBe(2)
    })
  })

  describe('handleBackspace', () => {
    it('removes last character', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleKeystroke('h', 'h', 100)
      useTypingStore.getState().handleKeystroke('x', 'e', 200)
      useTypingStore.getState().handleBackspace()
      const state = useTypingStore.getState()
      expect(state.input).toBe('h')
      expect(state.totalChars).toBe(1)
    })

    it('decrements correctChars when undoing correct keystroke', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleKeystroke('h', 'h', 100)
      useTypingStore.getState().handleBackspace()
      const state = useTypingStore.getState()
      expect(state.correctChars).toBe(0)
      expect(state.totalChars).toBe(0)
    })

    it('decrements errors when undoing error keystroke', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleKeystroke('x', 'h', 100)
      useTypingStore.getState().handleBackspace()
      const state = useTypingStore.getState()
      expect(state.errors).toBe(0)
      expect(state.totalChars).toBe(0)
    })

    it('does nothing on empty input', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleBackspace()
      expect(useTypingStore.getState().input).toBe('')
    })
  })

  describe('pauseSession / resumeSession', () => {
    it('pauses an active session', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().pauseSession()
      expect(useTypingStore.getState().status).toBe('paused')
    })

    it('does not pause if not active', () => {
      useTypingStore.getState().pauseSession()
      expect(useTypingStore.getState().status).toBe('idle')
    })

    it('resumes a paused session', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().pauseSession()
      useTypingStore.getState().resumeSession()
      const state = useTypingStore.getState()
      expect(state.status).toBe('active')
      expect(state.pausedAt).toBeNull()
    })

    it('does not resume if not paused', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().resumeSession()
      expect(useTypingStore.getState().status).toBe('active')
    })
  })

  describe('endSession', () => {
    it('calculates results correctly', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleKeystroke('h', 'h', 100)
      useTypingStore.getState().handleKeystroke('e', 'e', 200)
      useTypingStore.getState().handleKeystroke('l', 'l', 300)
      useTypingStore.getState().handleKeystroke('l', 'l', 400)
      useTypingStore.getState().handleKeystroke('o', 'o', 500)
      const result = useTypingStore.getState().endSession()
      expect(result.correctChars).toBe(5)
      expect(result.totalChars).toBe(5)
      expect(result.accuracy).toBe(100)
      expect(result.passageId).toBe('test-001')
      expect(useTypingStore.getState().status).toBe('complete')
    })

    it('throws if no active session', () => {
      expect(() => useTypingStore.getState().endSession()).toThrow('No active session')
    })
  })

  describe('reset', () => {
    it('resets all state to initial', () => {
      useTypingStore.getState().startSession(testPassage)
      useTypingStore.getState().handleKeystroke('h', 'h', 100)
      useTypingStore.getState().reset()
      const state = useTypingStore.getState()
      expect(state.passage).toBeNull()
      expect(state.input).toBe('')
      expect(state.status).toBe('idle')
      expect(state.correctChars).toBe(0)
      expect(state.totalChars).toBe(0)
    })
  })
})
