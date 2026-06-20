export type CatAnimationState = 'idle' | 'typing' | 'error' | 'celebrating' | 'sleeping' | 'focused'

interface CatState {
  state: CatAnimationState
  lastActivityAt: number
}

type CatEvent = 'KEYSTROKE' | 'ERROR' | 'SESSION_COMPLETE' | 'INACTIVITY' | 'ACCURACY_STREAK'

const transitions: Record<CatState['state'], Record<CatEvent, CatState['state']>> = {
  idle: {
    KEYSTROKE: 'typing',
    ERROR: 'error',
    SESSION_COMPLETE: 'celebrating',
    INACTIVITY: 'sleeping',
    ACCURACY_STREAK: 'focused',
  },
  typing: {
    KEYSTROKE: 'typing',
    ERROR: 'error',
    SESSION_COMPLETE: 'celebrating',
    INACTIVITY: 'idle',
    ACCURACY_STREAK: 'focused',
  },
  error: {
    KEYSTROKE: 'typing',
    ERROR: 'error',
    SESSION_COMPLETE: 'celebrating',
    INACTIVITY: 'idle',
    ACCURACY_STREAK: 'typing',
  },
  celebrating: {
    KEYSTROKE: 'typing',
    ERROR: 'error',
    SESSION_COMPLETE: 'celebrating',
    INACTIVITY: 'idle',
    ACCURACY_STREAK: 'focused',
  },
  sleeping: {
    KEYSTROKE: 'typing',
    ERROR: 'typing',
    SESSION_COMPLETE: 'celebrating',
    INACTIVITY: 'sleeping',
    ACCURACY_STREAK: 'typing',
  },
  focused: {
    KEYSTROKE: 'focused',
    ERROR: 'error',
    SESSION_COMPLETE: 'celebrating',
    INACTIVITY: 'idle',
    ACCURACY_STREAK: 'focused',
  },
}

export function catStateMachine(
  currentState: CatState['state'],
  event: CatEvent
): CatState['state'] {
  return transitions[currentState]?.[event] ?? currentState
}