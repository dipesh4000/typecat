import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from '../stores/settingsStore'
import { applyCharacterTheme } from '../features/cat-companion/characters'
import { AchievementToast } from '../features/progression/components/AchievementToast'

interface LayoutProps {
  children: ReactNode
}

interface ToastAchievement {
  id: string
  name: string
  description: string
}

const navLinks = [
  { href: '/', label: 'Practice', icon: 'keyboard' },
  { href: '/stats', label: 'Stats', icon: 'bar_chart' },
  { href: '/achievements', label: 'Badges', icon: 'emoji_events' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [toasts, setToasts] = useState<ToastAchievement[]>([])
  const theme = useSettingsStore((s) => s.theme)
  const characterId = useSettingsStore((s) => s.characterId)

  const dismissToast = useCallback(() => {
    setToasts((prev) => prev.slice(1))
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastAchievement[]
      setToasts((prev) => [...prev, ...detail])
    }
    window.addEventListener('achievement-unlocked', handler)
    return () => window.removeEventListener('achievement-unlocked', handler)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    let isDark = false

    if (theme === 'dark') {
      root.classList.add('dark')
      isDark = true
    } else if (theme === 'light') {
      root.classList.remove('dark')
      isDark = false
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
        isDark = true
      } else {
        root.classList.remove('dark')
        isDark = false
      }
    }

    applyCharacterTheme(characterId, isDark)
  }, [theme, characterId])

  return (
    <div className="h-screen bg-surface text-on-surface flex flex-col overflow-hidden transition-colors duration-200">
      {/* Top Nav */}
      <header className="w-full bg-surface border-b border-outline-variant z-50 flex-shrink-0 transition-colors duration-200">
        <nav className="flex items-center h-14 px-4 md:px-6 relative">
          {/* Left: Menu + Logo */}
          <div className="flex items-center shrink-0 z-10">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95 lg:block hidden"
            >
              {sidebarCollapsed ? 'menu_open' : 'menu'}
            </button>
            <Link to="/" className="font-bold text-lg md:text-xl text-primary tracking-tight lg:ml-3">TypeCat</Link>
          </div>

          {/* Center: Nav Links (desktop only) */}
          <div className={`hidden md:flex items-center gap-2 absolute left-1/2 top-1/2 -translate-y-1/2 transition-all duration-300 ${sidebarCollapsed ? 'lg:translate-x-[calc(-50%+32px)]' : 'lg:translate-x-[calc(-50%+128px)]'}`}>
            {navLinks.filter(l => l.href !== '/settings').map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Profile (desktop) */}
          <div className="hidden md:flex items-center shrink-0 ml-auto z-10">
            <button
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center cursor-pointer active:scale-95 hover:ring-2 hover:ring-primary transition-all"
            >
              <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                person
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div className="flex flex-1 min-h-0">
        <Sidebar collapsed={sidebarCollapsed} />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <div className="max-w-[1024px] mx-auto px-4 md:px-6 py-3 md:py-4 pb-20 md:pb-4">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 flex items-center justify-around h-14">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant active:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-icon' : ''}`}>
                {link.icon}
              </span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {toasts.length > 0 && (
        <AchievementToast
          key={toasts[0].id}
          name={toasts[0].name}
          description={toasts[0].description}
          onDismiss={dismissToast}
        />
      )}
    </div>
  )
}
