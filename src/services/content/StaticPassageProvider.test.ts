import { describe, it, expect } from 'vitest'
import { StaticPassageProvider } from './StaticPassageProvider'

describe('StaticPassageProvider', () => {
  it('returns passages for all categories', () => {
    const passages = StaticPassageProvider.getPassages()
    expect(passages.length).toBeGreaterThan(0)
  })

  it('filters by category', () => {
    const english = StaticPassageProvider.getPassages('english')
    expect(english.length).toBeGreaterThan(0)
    english.forEach((p) => expect(p.category).toBe('english'))
  })

  it('filters by difficulty', () => {
    const easy = StaticPassageProvider.getPassages(undefined, { difficulty: 'easy' })
    expect(easy.length).toBeGreaterThan(0)
    easy.forEach((p) => expect(p.difficulty).toBe('easy'))
  })

  it('filters by category and difficulty', () => {
    const results = StaticPassageProvider.getPassages('anime', { difficulty: 'medium' })
    results.forEach((p) => {
      expect(p.category).toBe('anime')
      expect(p.difficulty).toBe('medium')
    })
  })

  it('getPassageById returns a passage', () => {
    const passages = StaticPassageProvider.getPassages()
    const first = passages[0]
    expect(StaticPassageProvider.getPassageById(first.id)).toEqual(first)
  })

  it('getPassageById returns null for unknown id', () => {
    expect(StaticPassageProvider.getPassageById('nonexistent')).toBeNull()
  })
})
