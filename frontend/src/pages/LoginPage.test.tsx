import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { LoginPage } from './LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Landed on home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders email and password fields', () => {
    renderLoginPage()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows an error message on incorrect credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '',
      } as Response),
    )
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'wrong@x.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument()
  })

  it('navigates away from /login after a successful login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'jwt-token',
          user: { id: 1, firstName: 'G', lastName: 'S', gender: 'Male', shipId: null, jabatanId: null, phone: '', userType: 'GS', email: 'gs@x.com' },
        }),
      } as Response),
    )
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(screen.getByLabelText(/email/i), 'gs@x.com')
    await user.type(screen.getByLabelText(/password/i), 'correctpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(screen.getByText('Landed on home')).toBeInTheDocument())
  })
})
