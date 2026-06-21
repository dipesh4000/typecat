import { describe, it, expect, beforeEach } from 'vitest'
import { CustomPassageProvider } from './CustomPassageProvider'

describe('CustomPassageProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty passages', () => {
    expect(CustomPassageProvider.getPassages()).toEqual([])
  })

  it('adds a passage and retrieves it', () => {
    const added = CustomPassageProvider.addPassage({
      category: 'custom',
      difficulty: 'easy',
      text: 'Hello world',
      subcategory: 'My Text',
    })
    expect(added.id).toMatch(/^custom-/)
    expect(CustomPassageProvider.getPassages()).toHaveLength(1)
    expect(CustomPassageProvider.getPassageById(added.id)?.text).toBe('Hello world')
  })

  it('updates a passage', () => {
    const added = CustomPassageProvider.addPassage({
      category: 'custom',
      difficulty: 'easy',
      text: 'Old text',
    })
    CustomPassageProvider.updatePassage(added.id, { text: 'New text', difficulty: 'hard' })
    const updated = CustomPassageProvider.getPassageById(added.id)
    expect(updated?.text).toBe('New text')
    expect(updated?.difficulty).toBe('hard')
  })

  it('removes a passage', () => {
    const added = CustomPassageProvider.addPassage({
      category: 'custom',
      difficulty: 'easy',
      text: 'Delete me',
    })
    CustomPassageProvider.removePassage(added.id)
    expect(CustomPassageProvider.getPassages()).toHaveLength(0)
  })

  it('filters by difficulty', () => {
    CustomPassageProvider.addPassage({ category: 'custom', difficulty: 'easy', text: 'A' })
    CustomPassageProvider.addPassage({ category: 'custom', difficulty: 'hard', text: 'B' })
    expect(CustomPassageProvider.getPassages(undefined, { difficulty: 'easy' })).toHaveLength(1)
  })

  it('persists to localStorage', () => {
    CustomPassageProvider.addPassage({ category: 'custom', difficulty: 'easy', text: 'Persist' })
    const stored = JSON.parse(localStorage.getItem('typecat-custom-passages') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Persist')
  })
})
