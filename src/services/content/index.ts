export { StaticPassageProvider } from './StaticPassageProvider'
export { CustomPassageProvider } from './CustomPassageProvider'
import { StaticPassageProvider } from './StaticPassageProvider'
import { CustomPassageProvider } from './CustomPassageProvider'
import type { PassageProvider } from './PassageProvider'
import type { Passage } from '../../shared/types'

export const passageProvider: PassageProvider = {
  getPassages(category?, filters?) {
    if (category === 'custom') {
      return CustomPassageProvider.getPassages(undefined, filters)
    }
    return StaticPassageProvider.getPassages(category, filters)
  },

  getPassageById(id: string): Passage | null {
    if (id.startsWith('custom-')) {
      return CustomPassageProvider.getPassageById(id)
    }
    return StaticPassageProvider.getPassageById(id)
  },

  addPassage(passage) {
    return CustomPassageProvider.addPassage(passage)
  },

  updatePassage(id, updates) {
    CustomPassageProvider.updatePassage(id, updates)
  },

  removePassage(id) {
    CustomPassageProvider.removePassage(id)
  },
}
