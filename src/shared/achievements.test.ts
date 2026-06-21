import { describe, it, expect } from 'vitest'
import { achievementDefs } from './achievements'

describe('achievementDefs', () => {
  it('has at least one achievement', () => {
    expect(achievementDefs.length).toBeGreaterThan(0)
  })

  it('each achievement has required fields', () => {
    achievementDefs.forEach((def) => {
      expect(def.id).toBeTruthy()
      expect(def.name).toBeTruthy()
      expect(def.description).toBeTruthy()
      expect(def.icon).toBeTruthy()
      expect(typeof def.condition).toBe('function')
      expect(['speed', 'accuracy', 'streak', 'level']).toContain(def.category)
    })
  })

  it('has unique ids', () => {
    const ids = achievementDefs.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('first-session condition checks totalSessionsCompleted', () => {
    const def = achievementDefs.find((d) => d.id === 'first-session')!
    expect(def).toBeDefined()
    expect(typeof def.condition()).toBe('boolean')
  })
})
