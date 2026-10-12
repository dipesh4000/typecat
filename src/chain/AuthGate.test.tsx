import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthGate } from './AuthGate'
import App from '../app/App'

afterEach(cleanup)
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})
function Location() { return <output data-testid="location">{useLocation().pathname}</output> }

describe('login-first routing', () => {
  it.each(['/', '/stats', '/achievements', '/settings', '/leaderboard', '/unknown'])(
    'protects a direct visit to %s', async path => {
      render(<MemoryRouter initialEntries={[path]}><Location /><AuthGate ready authenticated={false} onLogin={vi.fn()}><p>Protected content</p></AuthGate></MemoryRouter>)
      expect(await screen.findByRole('heading', { name: 'Welcome to TypeCat' })).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/login')
      expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    },
  )
  it('opens the email login flow and restores the requested page after authentication', async () => {
    const login = vi.fn()
    const view = (authenticated: boolean) => <MemoryRouter initialEntries={['/stats']}><Location /><AuthGate ready authenticated={authenticated} onLogin={login}><p>Protected content</p></AuthGate></MemoryRouter>
    const { rerender } = render(view(false))
    fireEvent.click(await screen.findByRole('button', { name: 'Continue with email' }))
    expect(login).toHaveBeenCalledOnce()
    rerender(view(true))
    expect(await screen.findByText('Protected content')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/stats')
  })
  it('waits for restored authentication instead of exposing the app', () => {
    render(<MemoryRouter><AuthGate ready={false} authenticated={false}><p>Protected content</p></AuthGate></MemoryRouter>)
    expect(screen.getByRole('status')).toHaveTextContent('Loading your account')
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
  it('does not allow access when the Privy App ID is missing', () => {
    render(<MemoryRouter initialEntries={['/login']}><AuthGate ready authenticated={false}><p>Protected content</p></AuthGate></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Continue with email' })).toBeDisabled()
  })
})

describe('authenticated app routes', () => {
  it.each([
    ['/', 'button', /Start/],
    ['/stats', 'heading', 'Current Module'],
    ['/achievements', 'heading', 'Achievements'],
    ['/settings', 'heading', 'Profile'],
    ['/leaderboard', 'heading', 'Leaderboard'],
    ['/unknown', 'button', /Start/],
  ] as const)('renders %s', async (path, role, name) => {
    render(<MemoryRouter initialEntries={[path]}><AuthGate ready authenticated><App /></AuthGate></MemoryRouter>)
    if (path === '/stats') expect(await screen.findByText('Lifetime Bests')).toBeInTheDocument()
    else expect(await screen.findByRole(role, { name })).toBeInTheDocument()
  })
})
