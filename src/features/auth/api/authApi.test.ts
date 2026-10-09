import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '~/helpers/apiHelper'
import { authApi } from './authApi'

vi.mock('~/helpers/apiHelper', () => ({ apiFetch: vi.fn() }))

describe('authApi', () => {
  beforeEach(() => vi.resetAllMocks())

  it('logs in without a token and returns the authenticated user and token', async () => {
    const response = { user: { id: 1, name: 'Delcom', email: 'hello@example.com' }, token: 'access' }
    vi.mocked(apiFetch).mockResolvedValue(response)
    await expect(authApi.login({ email: 'hello@example.com', password: 'secret' })).resolves.toEqual(response)
    expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'hello@example.com', password: 'secret' },
      token: null,
    })
  })

  it('registers accounts and logs out through their documented endpoints', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    await expect(authApi.register({ name: 'Delcom', email: 'hello@example.com', password: 'secret' })).resolves.toBeUndefined()
    expect(apiFetch).toHaveBeenNthCalledWith(1, '/auth/register', {
      method: 'POST',
      body: { name: 'Delcom', email: 'hello@example.com', password: 'secret' },
      token: null,
    })
    vi.mocked(apiFetch).mockResolvedValue({ message: 'Signed out' })
    await expect(authApi.logout()).resolves.toEqual({ message: 'Signed out' })
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/auth/logout', { method: 'POST' })
  })
})
