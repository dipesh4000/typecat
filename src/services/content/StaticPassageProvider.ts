import type { Passage } from '../../shared/types'
import type { PassageProvider } from './PassageProvider'
import englishPassages from '../../data/passages/english.json'
import animePassages from '../../data/passages/anime.json'
import programmingPassages from '../../data/passages/programming.json'

const allPassages: Passage[] = [
  ...(englishPassages as Passage[]),
  ...(animePassages as Passage[]),
  ...(programmingPassages as Passage[]),
]

export const StaticPassageProvider: PassageProvider = {
  getPassages(category?, filters?) {
    let passages = allPassages

    if (category) {
      passages = passages.filter((p) => p.category === category)
    }

    if (filters?.difficulty) {
      passages = passages.filter((p) => p.difficulty === filters.difficulty)
    }

    if (filters?.subcategory) {
      passages = passages.filter((p) => p.subcategory === filters.subcategory)
    }

    return passages
  },

  getPassageById(id: string): Passage | null {
    return allPassages.find((p) => p.id === id) ?? null
  },

  addPassage() { throw new Error('Cannot add to static passages') },
  updatePassage() { throw new Error('Cannot update static passages') },
  removePassage() { throw new Error('Cannot remove static passages') },
}