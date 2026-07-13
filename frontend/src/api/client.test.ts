import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, getToken, setToken } from './client'

function mockFetchOnce(response: Partial<Response> & { jsonBody?: unknown; textBody?: string }) {
  const { jsonBody, textBody, ...rest } = response
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => jsonBody,
    text: async () => textBody ?? '',
    ...rest,
  } as Response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends no Authorization header when no token is stored', async () => {
    const fetchMock = mockFetchOnce({ jsonBody: { ok: true } })

    await api.get('/whatever')

    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('attaches a Bearer Authorization header when a token is stored', async () => {
    setToken('abc123')
    const fetchMock = mockFetchOnce({ jsonBody: { ok: true } })

    await api.get('/whatever')

    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc123')
  })

  it('returns parsed JSON on success', async () => {
    mockFetchOnce({ jsonBody: { hello: 'world' } })

    const result = await api.get<{ hello: string }>('/thing')

    expect(result).toEqual({ hello: 'world' })
  })

  it('returns undefined for 204 No Content', async () => {
    mockFetchOnce({ status: 204, jsonBody: undefined })

    const result = await api.delete('/thing/1')

    expect(result).toBeUndefined()
  })

  it('throws ApiError with status and message on failure', async () => {
    mockFetchOnce({ ok: false, status: 400, statusText: 'Bad Request', textBody: 'Invalid input' })

    await expect(api.post('/thing', {})).rejects.toMatchObject({
      status: 400,
      message: 'Invalid input',
    })
  })

  it('throws ApiError instance', async () => {
    mockFetchOnce({ ok: false, status: 404, statusText: 'Not Found', textBody: '' })

    await expect(api.get('/missing')).rejects.toBeInstanceOf(ApiError)
  })

  it('clears the token and dispatches ablmess:unauthorized on 401 when a token was present', async () => {
    setToken('expired-token')
    mockFetchOnce({ ok: false, status: 401, statusText: 'Unauthorized', textBody: '' })
    const listener = vi.fn()
    window.addEventListener('ablmess:unauthorized', listener)

    await expect(api.get('/secure')).rejects.toBeInstanceOf(ApiError)

    expect(getToken()).toBeNull()
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener('ablmess:unauthorized', listener)
  })

  it('does not dispatch ablmess:unauthorized on 401 when no token was present (e.g. bad login)', async () => {
    mockFetchOnce({ ok: false, status: 401, statusText: 'Unauthorized', textBody: '' })
    const listener = vi.fn()
    window.addEventListener('ablmess:unauthorized', listener)

    await expect(api.post('/auth/login', { email: 'x', password: 'y' })).rejects.toBeInstanceOf(ApiError)

    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener('ablmess:unauthorized', listener)
  })
})
