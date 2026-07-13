import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { UserType } from '../api/types'

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserType[] }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.userType)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
