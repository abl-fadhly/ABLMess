import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { getToken } from '../api/client'

function TestConsumer() {
  const { user, login, logout, isLoading } = useAuth()
  return (
    <div>
      <span data-testid="user">{user ? `${user.email} (${user.userType})` : 'none'}</span>
      <span data-testid="loading">{isLoading ? 'loading' : 'idle'}</span>
      <button onClick={() => login('gs@x.com', 'pw')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

function mockLoginResponse() {
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
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts logged out when there is no stored token', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('login stores the token and user, and updates context', async () => {
    mockLoginResponse()

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('login').click()
    })

    expect(screen.getByTestId('user').textContent).toBe('gs@x.com (GS)')
    expect(getToken()).toBe('jwt-token')
  })

  it('logout clears the token and user', async () => {
    mockLoginResponse()

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('login').click()
    })
    expect(getToken()).toBe('jwt-token')

    act(() => {
      screen.getByText('logout').click()
    })

    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(getToken()).toBeNull()
  })

  it('logs out automatically when an ablmess:unauthorized event fires', async () => {
    mockLoginResponse()

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('login').click()
    })
    expect(screen.getByTestId('user').textContent).toBe('gs@x.com (GS)')

    act(() => {
      window.dispatchEvent(new Event('ablmess:unauthorized'))
    })

    expect(screen.getByTestId('user').textContent).toBe('none')
  })
})
