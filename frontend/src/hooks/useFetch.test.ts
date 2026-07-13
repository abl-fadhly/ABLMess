import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { useFetch } from './useFetch'
import { ApiError } from '../api/client'

describe('useFetch', () => {
  it('starts in a loading state and resolves with data', async () => {
    const loader = vi.fn().mockResolvedValue({ value: 42 })

    const { result } = renderHook(() => useFetch(loader))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual({ value: 42 })
    expect(result.current.error).toBeNull()
  })

  it('surfaces ApiError messages', async () => {
    const loader = vi.fn().mockRejectedValue(new ApiError(404, 'Not found'))

    const { result } = renderHook(() => useFetch(loader))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Not found')
    expect(result.current.data).toBeNull()
  })

  it('falls back to a generic message for non-ApiError failures', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useFetch(loader))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Failed to load data.')
  })

  it('reload() re-invokes the loader', async () => {
    const loader = vi.fn().mockResolvedValue('first')

    const { result } = renderHook(() => useFetch(loader))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(loader).toHaveBeenCalledTimes(1)

    loader.mockResolvedValue('second')
    act(() => result.current.reload())

    await waitFor(() => expect(result.current.data).toBe('second'))
    expect(loader).toHaveBeenCalledTimes(2)
  })
})
