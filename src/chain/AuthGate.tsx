import type { CSSProperties, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Brand } from '../shared/components/Brand'

const features = [
  ['keyboard', 'Guided practice', 'English, anime, programming, and your own text—with three difficulty levels.'],
  ['speed', 'Live feedback', 'See WPM, accuracy, progress, and mistakes while your fingers are still moving.'],
  ['pets', 'Nine companions', 'Pick a typing buddy whose hands react to the exact key you press.'],
  ['monitoring', 'Progress that sticks', 'Track personal bests, session history, streaks, levels, and earned XP.'],
  ['workspace_premium', 'Badges to chase', 'Unlock milestones for speed, accuracy, consistency, and practice volume.'],
  ['public', 'On-chain ranks', 'Publish verified scores to Avalanche and compete on a transparent leaderboard.'],
]

export function AuthGate({ ready, authenticated, onLogin, onGoogleLogin, children }: {
  ready: boolean
  authenticated: boolean
  onLogin?: () => void
  onGoogleLogin?: () => void
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
  return <main className="landing-page">
    <header className="landing-nav">
      <Brand href="/login" aria-label="TypeCat home" />
      <nav aria-label="Landing page"><a href="#features">Features</a><a href="#companions">Companions</a><a href="#proof">On-chain</a></nav>
      <button onClick={onLogin} disabled={!onLogin} className="landing-nav-cta">Start typing <span aria-hidden="true">→</span></button>
    </header>

    <section className="landing-hero">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow"><span /> YOUR DAILY TYPING RITUAL</p>
        <h1>Type faster.<br />Stay for the <em>cat.</em></h1>
        <p>A focused typing trainer with reactive companions, useful progress tracking, and verified Avalanche leaderboards.</p>
        <div className="landing-actions">
          <button onClick={onLogin} disabled={!onLogin} className="landing-primary">Practice for free <span aria-hidden="true">arrow_forward</span></button>
          <a href="#features">See what’s inside</a>
        </div>
        <button onClick={onGoogleLogin} disabled={!onGoogleLogin} className="landing-google"><span aria-hidden="true">G</span> Continue with Google</button>
        <div className="landing-trust"><span><i /> No password</span><span><i /> No wallet setup</span><span><i /> Progress saved</span></div>
      </div>
      <div className="landing-demo" aria-label="Preview of TypeCat practice">
        <div className="landing-demo-bar"><span><i /><i /><i /></span><b>practice / english</b><span>42 WPM</span></div>
        <div className="landing-demo-copy"><span>small steps become</span><br />remarkable <strong>progress.</strong><i /></div>
        <img src="/characters/haohao/cover.png" alt="Red panda typing companion at a keyboard" width="766" height="444" />
        <div className="landing-demo-footer"><span>Accuracy <b>98%</b></span><span>Streak <b>7 days</b></span><span>Level <b>12</b></span></div>
      </div>
    </section>

    <section className="landing-strip" aria-label="Available practice modes"><span>English passages</span><i /> <span>Anime quotes</span><i /> <span>Programming drills</span><i /> <span>Custom text</span></section>

    <section className="landing-section" id="features">
      <div className="landing-section-heading"><p className="landing-eyebrow"><span /> EVERYTHING YOU NEED</p><h2>Practice that feels like play.</h2><p>Nothing noisy. Just the feedback, motivation, and small wins that keep you coming back.</p></div>
      <div className="landing-feature-grid">{features.map(([icon, title, copy], index) => <article key={title} className={index === 0 || index === 5 ? 'feature-wide' : ''}><span className="material-symbols-outlined">{icon}</span><small>0{index + 1}</small><h3>{title}</h3><p>{copy}</p>{index === 0 && <div className="feature-pills"><b>English</b><b>Anime</b><b>Code</b><b>Custom</b></div>}{index === 5 && <div className="feature-chain"><i /> Avalanche mainnet <span>Verified results</span></div>}</article>)}</div>
    </section>

    <section className="landing-companions" id="companions">
      <div><p className="landing-eyebrow"><span /> MEET THE CREW</p><h2>Nine tiny reasons<br />to keep typing.</h2><p>Every companion has its own palette and hand-drawn key reactions. Choose the one that makes practice feel like yours.</p><button onClick={onLogin} disabled={!onLogin} className="landing-text-button">Choose your companion <span aria-hidden="true">→</span></button></div>
      <div className="companion-stack">{['classic', 'haohao', 'elysia', 'xiaohei'].map((id, index) => <figure key={id} style={{ '--i': index } as CSSProperties}><img src={`/characters/${id}/cover.png`} alt={`${id} typing companion`} /></figure>)}</div>
    </section>

    <section className="landing-proof" id="proof">
      <div><span className="material-symbols-outlined">verified_user</span><p className="landing-eyebrow">PROOF, NOT PROMISES</p><h2>Your best runs,<br />verified on Avalanche.</h2></div>
      <p>Ranked sessions are signed, recorded on-chain, and linked directly from the leaderboard. Your practice stays simple—the blockchain stays quietly in the background.</p>
      <div className="proof-flow"><span>Type</span><i>→</i><span>Verify</span><i>→</i><span>Rank</span></div>
    </section>

    <section className="landing-final">
      <img src="/characters/classic/cover.png" alt="Classic TypeCat companion" />
      <p className="landing-eyebrow"><span /> YOUR NEXT PERSONAL BEST</p><h2>Ready when your fingers are.</h2><p>One email. No password. Your first passage is waiting.</p>
      <button onClick={onLogin} disabled={!onLogin} className="landing-primary">Start typing <span aria-hidden="true">arrow_forward</span></button>
      <button onClick={onGoogleLogin} disabled={!onGoogleLogin} className="landing-google"><span aria-hidden="true">G</span> Continue with Google</button>
      {!onLogin && <small>Email login is not configured. Set VITE_PRIVY_APP_ID and redeploy.</small>}
    </section>

    <footer className="landing-footer"><Brand href="/login" /><span>Made for the love of typing.</span><span>Practice · Progress · Purr</span></footer>
  </main>
}
