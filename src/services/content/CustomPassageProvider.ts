import type { Passage } from '../../shared/types'
import type { PassageProvider } from './PassageProvider'
import { storage } from '../storage'

const STORAGE_KEY = 'typecat-custom-passages'

function load(): Passage[] {
  return storage.get<Passage[]>(STORAGE_KEY) ?? []
}

function save(passages: Passage[]): void {
  storage.set(STORAGE_KEY, passages)
}

export const CustomPassageProvider: PassageProvider = {
  getPassages(_category?, filters?) {
    let passages = load()

    if (filters?.difficulty) {
      passages = passages.filter((p) => p.difficulty === filters.difficulty)
    }

    if (filters?.subcategory) {
      passages = passages.filter((p) => p.subcategory === filters.subcategory)
    }

    return passages
  },

  getPassageById(id: string): Passage | null {
    return load().find((p) => p.id === id) ?? null
  },

  addPassage(passage: Omit<Passage, 'id'>): Passage {
    const passages = load()
    const newPassage: Passage = {
      ...passage,
      id: `custom-${Date.now()}`,
      category: 'custom',
    }
    passages.push(newPassage)
    save(passages)
    return newPassage
  },

  updatePassage(id: string, updates: Partial<Pick<Passage, 'text' | 'difficulty' | 'subcategory'>>): void {
    const passages = load()
    const index = passages.findIndex((p) => p.id === id)
    if (index === -1) return
    passages[index] = { ...passages[index], ...updates }
    save(passages)
  },

  removePassage(id: string): void {
    save(load().filter((p) => p.id !== id))
  },
}
