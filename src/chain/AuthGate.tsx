import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export function AuthGate({ ready, authenticated, onLogin, children }: {
  ready: boolean
  authenticated: boolean
  onLogin?: () => void
  children: ReactNode
}) {
  const location = useLocation()
  if (!ready) return <div className="min-h-screen grid place-items-center bg-surface text-on-surface" role="status">Loading your account…</div>
  if (authenticated) {
    if (location.pathname !== '/login') return <>{children}</>
    const from = location.state?.from
    const target = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && from.split('?')[0] !== '/login' ? from : '/'
    return <Navigate to={target} replace />
  }
  if (location.pathname !== '/login') return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface text-on-surface p-6">
      <section className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <img src="/characters/classic/cover.png" alt="TypeCat companion" className="w-24 h-24 object-contain mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-3">Welcome to TypeCat</h1>
        <p className="text-on-surface-variant text-sm mb-6">Practice your typing, beat your best, and climb the leaderboard.</p>
        <button onClick={onLogin} disabled={!onLogin} className="w-full bg-primary text-on-primary font-semibold rounded-lg py-3 disabled:opacity-50">Continue with email</button>
        <p className="text-xs text-on-surface-variant mt-4">{onLogin ? 'We’ll email you a one-time code. No password needed.' : 'Email login is not configured. Set VITE_PRIVY_APP_ID and redeploy.'}</p>
      </section>
    </main>
  )
}
