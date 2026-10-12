// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { app } from './app.ts'
import health from '../api/health.ts'
import verify from '../api/verify.ts'
import config from '../vercel.json' with { type: 'json' }

afterEach(() => vi.unstubAllEnvs())
describe('Vercel API routing', () => {
  it('allows the production frontend origin without granting arbitrary sites access', async () => {
    const allowed = await app.request('https://typecat-rust.vercel.app/api/health', { headers: { Origin: 'https://typecat-rust.vercel.app' } })
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe('https://typecat-rust.vercel.app')
    const denied = await app.request('/api/health', { headers: { Origin: 'https://untrusted.example' } })
    expect(denied.headers.get('Access-Control-Allow-Origin')).toBeNull()
    const preflight = await app.request('/api/verify', { method: 'OPTIONS', headers: { Origin: 'https://typecat-rust.vercel.app', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } })
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe('https://typecat-rust.vercel.app')
    expect(preflight.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })
  it('serves JSON health without deployment secrets', async () => {
    vi.stubEnv('GAME_ADDRESS', '')
    vi.stubEnv('VERIFIER_PRIVATE_KEY', '')
    const response = await health.fetch(new Request('https://typecat-rust.vercel.app/api/health'))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ ok: true, configured: false })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })
  it('returns a helpful 503 while the contract is not configured', async () => {
    vi.stubEnv('GAME_ADDRESS', '')
    const response = await verify.fetch(new Request('https://typecat-rust.vercel.app/api/verify', { method: 'POST', body: '{}' }))
    expect(response.status).toBe(503)
    expect(await response.json()).toHaveProperty('error')
  })
  it('rejects malformed input before contacting the chain', async () => {
    vi.stubEnv('GAME_ADDRESS', '0x1111111111111111111111111111111111111111')
    vi.stubEnv('VERIFIER_PRIVATE_KEY', `0x${'11'.repeat(32)}`)
    const response = await app.request('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player: 'invalid' }) })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid player or session' })
  })
  it('keeps wrong API methods and unknown routes out of the SPA', async () => {
    expect((await app.request('/api/verify')).status).toBe(405)
    expect((await app.request('/api/missing')).status).toBe(404)
    const fallback = new RegExp(`^${config.rewrites[0].source}$`)
    for (const path of ['/login', '/', '/stats', '/achievements', '/settings', '/leaderboard']) expect(fallback.test(path)).toBe(true)
    for (const path of ['/api/verify', '/api/health', '/api/missing', '/assets/app.js', '/favicon.svg', '/characters/classic/cover.png', '/Recording.m4a']) expect(fallback.test(path)).toBe(false)
  })
})
