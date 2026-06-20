import { type StorageAdapter } from './StorageAdapter'

export const LocalStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`Failed to save to localStorage: ${key}`)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      console.warn(`Failed to remove from localStorage: ${key}`)
    }
  },

  clear(): void {
    try {
      localStorage.clear()
    } catch {
      console.warn('Failed to clear localStorage')
    }
  },
}