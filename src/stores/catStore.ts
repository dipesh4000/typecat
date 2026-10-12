import { create } from 'zustand'

type AnimationState = 'idle' | 'typing' | 'error' | 'celebrating' | 'sleeping' | 'focused'

interface CatState {
  animationState: AnimationState
  activeKey: string | null
  keyPressId: number
  lastActivityAt: number

  setAnimationState: (state: AnimationState) => void
  pressKey: (key: string) => void
  releaseKey: (key: string) => void
  registerActivity: () => void
}

export const useCatStore = create<CatState>((set) => ({
  animationState: 'idle',
  activeKey: null,
  keyPressId: 0,
  lastActivityAt: Date.now(),

  setAnimationState: (animationState) => set({ animationState }),

  pressKey: (activeKey) => set((state) => ({ activeKey, keyPressId: state.keyPressId + 1 })),
  releaseKey: (key) => set((state) => state.activeKey === key ? { activeKey: null } : state),

  registerActivity: () => set({ lastActivityAt: Date.now() }),
}))
