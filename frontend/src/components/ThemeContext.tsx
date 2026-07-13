import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemePreference = 'light' | 'dark' | 'system'
type EffectiveTheme = 'light' | 'dark'

interface ThemeContextValue {
  effective: EffectiveTheme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'ablmess_theme'

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(pref: ThemePreference): EffectiveTheme {
  return pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref
}

function loadPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(loadPreference)
  const [effective, setEffective] = useState<EffectiveTheme>(() => resolve(preference))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
  }, [effective])

  useEffect(() => {
    setEffective(resolve(preference))
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => setEffective(resolve('system'))
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [preference])

  function toggle() {
    const next: ThemePreference = effective === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    setPreference(next)
  }

  return <ThemeContext.Provider value={{ effective, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
