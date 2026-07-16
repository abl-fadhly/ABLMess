import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { setToken } from '../api/client'
import type { UserDto } from '../api/types'

function seedLoggedInUser(userType: UserDto['userType']) {
  setToken('some-token')
  const user: UserDto = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    gender: 'Male',
    shipId: null,
    jabatanId: null,
    phone: '',
    userType,
    email: 'test@x.com',
    employeeCode: 'CRW-1001',
    photoUrl: null,
  }
  localStorage.setItem('ablmess_user', JSON.stringify(user))
}

function renderAt(path: string, roles?: UserDto['userType'][]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/secret"
            element={
              <ProtectedRoute roles={roles}>
                <div>Secret Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to /login when there is no logged-in user', () => {
    renderAt('/secret')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders children when the user is logged in and no roles are required', () => {
    seedLoggedInUser('Crew')

    renderAt('/secret')

    expect(screen.getByText('Secret Content')).toBeInTheDocument()
  })

  it('renders children when the user has an allowed role', () => {
    seedLoggedInUser('GS')

    renderAt('/secret', ['Admin', 'GS'])

    expect(screen.getByText('Secret Content')).toBeInTheDocument()
  })

  it('redirects to / when the user role is not allowed', () => {
    seedLoggedInUser('Crew')

    renderAt('/secret', ['Admin', 'GS'])

    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })
})
