import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from '../stores/settingsStore'
import { applyCharacterTheme } from '../features/cat-companion/characters'

interface LayoutProps {
  children: ReactNode
}

const navLinks = [
  { href: '/', label: 'Practice' },
  { href: '/stats', label: 'Stats' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/settings', label: 'Settings' },
]

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const theme = useSettingsStore((s) => s.theme)
  const characterId = useSettingsStore((s) => s.characterId)

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
        <nav className="flex justify-between items-center px-container-padding h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95 lg:block hidden"
            >
              {sidebarCollapsed ? 'menu_open' : 'menu'}
            </button>
            <Link to="/" className="font-bold text-lg text-primary">TypeCat</Link>
          </div>
          <div className="hidden md:flex items-center gap-8 text-body-md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`transition-colors cursor-pointer active:scale-95 ${
                  location.pathname === link.href
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-on-secondary-container hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95">
              notifications
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center cursor-pointer active:scale-95">
              <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                person
              </span>
            </div>
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
    </div>
  )
}