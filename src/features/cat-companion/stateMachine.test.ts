import { describe, it, expect } from 'vitest'
import { catStateMachine } from './stateMachine'
import type { CatAnimationState } from './stateMachine'

describe('catStateMachine', () => {
  it('transitions from idle to typing on KEYSTROKE', () => {
    expect(catStateMachine('idle', 'KEYSTROKE')).toBe('typing')
  })

  it('transitions from idle to error on ERROR', () => {
    expect(catStateMachine('idle', 'ERROR')).toBe('error')
  })

  it('transitions from idle to celebrating on SESSION_COMPLETE', () => {
    expect(catStateMachine('idle', 'SESSION_COMPLETE')).toBe('celebrating')
  })

  it('transitions from idle to sleeping on INACTIVITY', () => {
    expect(catStateMachine('idle', 'INACTIVITY')).toBe('sleeping')
  })

  it('transitions from idle to focused on ACCURACY_STREAK', () => {
    expect(catStateMachine('idle', 'ACCURACY_STREAK')).toBe('focused')
  })

  it('stays typing on KEYSTROKE', () => {
    expect(catStateMachine('typing', 'KEYSTROKE')).toBe('typing')
  })

  it('transitions typing to error on ERROR', () => {
    expect(catStateMachine('typing', 'ERROR')).toBe('error')
  })

  it('transitions error to typing on KEYSTROKE', () => {
    expect(catStateMachine('error', 'KEYSTROKE')).toBe('typing')
  })

  it('stays error on ERROR', () => {
    expect(catStateMachine('error', 'ERROR')).toBe('error')
  })

  it('transitions celebrating to typing on KEYSTROKE', () => {
    expect(catStateMachine('celebrating', 'KEYSTROKE')).toBe('typing')
  })

  it('transitions sleeping to typing on KEYSTROKE', () => {
    expect(catStateMachine('sleeping', 'KEYSTROKE')).toBe('typing')
  })

  it('stays sleeping on INACTIVITY', () => {
    expect(catStateMachine('sleeping', 'INACTIVITY')).toBe('sleeping')
  })

  it('stays focused on KEYSTROKE', () => {
    expect(catStateMachine('focused', 'KEYSTROKE')).toBe('focused')
  })

  it('transitions focused to error on ERROR', () => {
    expect(catStateMachine('focused', 'ERROR')).toBe('error')
  })

  it('returns current state for unknown state', () => {
    expect(catStateMachine('unknown' as CatAnimationState, 'KEYSTROKE')).toBe('unknown')
  })

  it('returns current state for unknown event', () => {
    expect(catStateMachine('idle', 'UNKNOWN' as any)).toBe('idle')
  })
})
