import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storage } from '../services/storage'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  soundEnabled: boolean
  reducedMotion: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'all' | 'english' | 'anime' | 'programming'
  characterId: string

  setTheme: (theme: SettingsState['theme']) => void
  toggleSound: () => void
  toggleReducedMotion: () => void
  setDifficulty: (difficulty: SettingsState['difficulty']) => void
  setCategory: (category: SettingsState['category']) => void
  setCharacter: (id: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      soundEnabled: true,
      reducedMotion: false,
      difficulty: 'medium',
      category: 'all',
      characterId: 'classic',

      setTheme: (theme) => set({ theme }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      setDifficulty: (difficulty) => set({ difficulty }),
      setCategory: (category) => set({ category }),
      setCharacter: (characterId) => set({ characterId }),
    }),
    {
      name: 'typecat:v1:settings',
      storage: {
        getItem: (name) => {
          const value = storage.get<SettingsState>(name)
          return value ? { state: value, version: 0 } : null
        },
        setItem: (name, value) => storage.set(name, value.state),
        removeItem: (name) => storage.remove(name),
      },
    }
  )
)