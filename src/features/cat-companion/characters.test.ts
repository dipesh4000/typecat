import { describe, it, expect } from 'vitest'
import { characters, getCharacter, getCharacterKeySprite } from './characters'

describe('characters', () => {
  it('has at least one character', () => {
    expect(characters.length).toBeGreaterThan(0)
  })

  it('each character has required fields', () => {
    characters.forEach((char) => {
      expect(char.id).toBeTruthy()
      expect(char.name).toBeTruthy()
      expect(char.cover).toBeTruthy()
      expect(char.background).toBeTruthy()
      expect(typeof char.hasRightKeys).toBe('boolean')
      expect(char.keyCount).toBeDefined()
      expect(char.theme).toBeDefined()
      expect(char.theme.light).toBeDefined()
      expect(char.theme.dark).toBeDefined()
    })
  })

  it('no character has nameCn field', () => {
    characters.forEach((char) => {
      expect('nameCn' in char).toBe(false)
    })
  })
})

describe('getCharacterKeySprite', () => {
  it('uses each character actual sprite inventory and hand folder', () => {
    expect(getCharacterKeySprite('haohao', 'a')).toContain('/left-keys/KeyA.png')
    expect(getCharacterKeySprite('haohao', 'j')).toContain('/right-keys/KeyJ.png')
    expect(getCharacterKeySprite('classic', 'a')).toBeNull()
    expect(getCharacterKeySprite('zimin', ' ')).toContain('/left-keys/Space.png')
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
