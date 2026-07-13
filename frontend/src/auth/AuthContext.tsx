import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from '../api/client'
import type { LoginResponse, UserDto } from '../api/types'

interface AuthContextValue {
  user: UserDto | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = 'ablmess_user'

function loadStoredUser(): UserDto | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserDto
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => (getToken() ? loadStoredUser() : null))
  const [isLoading, setIsLoading] = useState(false)

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password })
      setToken(response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  useEffect(() => {
    window.addEventListener('ablmess:unauthorized', logout)
    return () => window.removeEventListener('ablmess:unauthorized', logout)
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
