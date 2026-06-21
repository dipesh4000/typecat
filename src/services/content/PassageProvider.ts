import type { Passage } from '../../shared/types'

export interface PassageProvider {
  getPassages(category?: Passage['category'], filters?: { difficulty?: Passage['difficulty']; subcategory?: string }): Passage[]
  getPassageById(id: string): Passage | null
}