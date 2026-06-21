import { describe, it, expect } from 'vitest'
import { characters, getCharacter } from './characters'

describe('characters', () => {
  it('has at least one character', () => {
    expect(characters.length).toBeGreaterThan(0)
  })

  it('each character has required fields', () => {
    characters.forEach((char) => {
      expect(char.id).toBeTruthy()
      expect(char.name).toBeTruthy()
      expect(char.cover).toBeTruthy()
      expect(typeof char.hasRightKeys).toBe('boolean')
      expect(char.keyCount).toBeDefined()
      expect(char.theme).toBeDefined()
      expect(char.theme.light).toBeDefined()
      expect(char.theme.dark).toBeDefined()
    })
  })

  it('no character has nameCn field', () => {
    characters.forEach((char) => {
      expect((char as any).nameCn).toBeUndefined()
    })
  })
})

describe('getCharacter', () => {
  it('returns the classic cat by default', () => {
    expect(getCharacter('classic').id).toBe('classic')
  })

  it('returns the requested character', () => {
    expect(getCharacter('xiaohei').id).toBe('xiaohei')
  })

  it('falls back to first character for unknown id', () => {
    expect(getCharacter('nonexistent').id).toBe(characters[0].id)
  })
})
