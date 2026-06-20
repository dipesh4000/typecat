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
  { href: '/', label: 'Practice' },
  { href: '/stats', label: 'Stats' },
  { href: '/achievements', label: 'Achievements' },
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

  // Apply dark mode class and character theme to html element
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
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
        isDark = true
      } else {
        root.classList.remove('dark')
        isDark = false
      }
    }

    // Apply character theme
    applyCharacterTheme(characterId, isDark)
  }, [theme, characterId])

  return (
    <div className="h-screen bg-surface text-on-surface flex flex-col overflow-hidden transition-colors duration-200">
      {/* Top Nav */}
      <header className="w-full bg-surface border-b border-outline-variant z-50 flex-shrink-0 transition-colors duration-200">
        <nav className="flex justify-between items-center h-14">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-4 pl-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95 lg:block hidden"
            >
              {sidebarCollapsed ? 'menu_open' : 'menu'}
            </button>
            <Link to="/" className="font-bold text-xl text-primary tracking-tight">TypeCat</Link>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 pr-4">
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
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <div className="max-w-[1024px] mx-auto px-gutter py-4">
            {children}
          </div>
        </main>
      </div>

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