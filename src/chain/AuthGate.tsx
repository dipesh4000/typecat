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
    <main className="login-page">
      <header className="login-header">
        <a href="/login" className="login-brand" aria-label="TypeCat home"><img src="/favicon.svg" alt="" width="36" height="36" />TypeCat<span className="login-brand-dot">.</span></a>
        <span className="login-header-note">A little practice. A lot of progress.</span>
      </header>
      <div className="login-content">
        <section className="login-story" aria-label="Meet TypeCat">
          <p className="login-eyebrow"><span /> YOUR DAILY TYPING RITUAL</p>
          <h2>Find your flow.<br />One <span>keystroke</span><br />at a time.</h2>
          <p className="login-description">A cozy corner to type a little faster, beat your personal best, and keep a cat company.</p>
          <div className="login-demo" aria-label="Illustration of your typing companion">
            <div className="login-demo-top"><span><i /><i /><i /></span><span>the practice corner</span><span aria-hidden="true">↗</span></div>
            <div className="login-demo-body">
              <div className="login-demo-text" aria-hidden="true"><span>small steps,</span><br />big <span className="login-demo-caret">possibilities.</span></div>
              <img src="/characters/classic/cover.png" alt="A happy cat reaching for the keyboard" width="766" height="444" />
            </div>
            <div className="login-demo-bottom"><span><span className="login-status-dot" /> A companion for every session</span><span aria-hidden="true">⌘ &nbsp; type. repeat.</span></div>
          </div>
          <div className="login-perks">
            <div><span className="material-symbols-outlined" aria-hidden="true">keyboard</span><span>Build your rhythm<small>Passages for every pace</small></span></div>
            <div><span className="material-symbols-outlined" aria-hidden="true">trending_up</span><span>See your progress<small>Personal bests & badges</small></span></div>
            <div><span className="material-symbols-outlined" aria-hidden="true">emoji_events</span><span>Climb the ranks<small>Compete on the leaderboard</small></span></div>
          </div>
        </section>
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-icon"><span className="material-symbols-outlined" aria-hidden="true">waving_hand</span></div>
          <p className="login-eyebrow">YOUR NEXT PERSONAL BEST STARTS HERE</p>
          <h1 id="login-title">Welcome to TypeCat</h1>
          <p className="login-card-description">Make yourself at home.<br />Sign in or create an account with your email.</p>
          <button onClick={onLogin} disabled={!onLogin} className="login-button"><span className="material-symbols-outlined" aria-hidden="true">mail</span>Continue with email<span aria-hidden="true">→</span></button>
          <p className="login-otp-note">{onLogin ? 'We’ll email you a one-time code. No password needed.' : 'Email login is not configured. Set VITE_PRIVY_APP_ID and redeploy.'}</p>
          <div className="login-card-divider" />
          <div className="login-reassurance"><span className="material-symbols-outlined" aria-hidden="true">lock</span><div>Just you, your keyboard, and your cat.<small>Your progress is saved to your account.</small></div></div>
          <div className="login-powered">Secure email login with <strong>Privy</strong><span aria-hidden="true">↗</span></div>
        </section>
      </div>
      <footer className="login-footer"><span>Made for the love of typing.</span><span>No passwords. Just progress. <span aria-hidden="true">✦</span></span></footer>
    </main>
  )
}
