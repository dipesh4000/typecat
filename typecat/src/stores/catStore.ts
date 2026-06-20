import { create } from 'zustand'

type AnimationState = 'idle' | 'typing' | 'error' | 'celebrating' | 'sleeping' | 'focused'

interface CatState {
  animationState: AnimationState
  activeKey: string | null
  lastActivityAt: number

  setAnimationState: (state: AnimationState) => void
  setActiveKey: (key: string | null) => void
  registerActivity: () => void
}

export const useCatStore = create<CatState>((set) => ({
  animationState: 'idle',
  activeKey: null,
  lastActivityAt: Date.now(),

  setAnimationState: (animationState) => set({ animationState }),

  setActiveKey: (activeKey) => set({ activeKey }),

  registerActivity: () => set({ lastActivityAt: Date.now() }),
}))