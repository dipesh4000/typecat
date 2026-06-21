import type { Passage } from '../../shared/types'

export interface PassageProvider {
  getPassages(category?: Passage['category'], filters?: { difficulty?: Passage['difficulty']; subcategory?: string }): Passage[]
  getPassageById(id: string): Passage | null
  addPassage(passage: Omit<Passage, 'id'>): Passage
  updatePassage(id: string, updates: Partial<Pick<Passage, 'text' | 'difficulty' | 'subcategory'>>): void
  removePassage(id: string): void
}