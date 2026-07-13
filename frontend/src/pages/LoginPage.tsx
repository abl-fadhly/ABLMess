import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import { Button, Input, Label } from '../components/ui'
import { ErrorBanner } from '../components/Status'

export function LoginPage() {
  const { user, login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Incorrect email or password.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-primary-50 dark:from-neutral-50 dark:via-surface dark:to-neutral-200 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-600/30">
            A
          </div>
          <h1 className="mt-4 text-xl font-bold text-neutral-900 tracking-tight">ABLMess</h1>
          <p className="text-sm text-neutral-500">Crew mess management</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-neutral-200 rounded-2xl p-6 shadow-sm dark:shadow-black/20 space-y-4"
        >
          {error && <ErrorBanner message={error} />}

          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
