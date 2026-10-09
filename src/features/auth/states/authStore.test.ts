import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { clearAccessToken, getAccessToken, putAccessToken } from '~/helpers/apiHelper'
import { authApi } from '~/features/auth/api/authApi'
import { userApi } from '~/features/users/api/userApi'
import { useAuthStore } from './authStore'

vi.mock('~/features/auth/api/authApi', () => ({ authApi: { login: vi.fn(), register: vi.fn(), logout: vi.fn() } }))
vi.mock('~/features/users/api/userApi', () => ({ userApi: { getMe: vi.fn() } }))
vi.mock('~/helpers/apiHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/helpers/apiHelper')>()
  return { ...actual, getAccessToken: vi.fn(), putAccessToken: vi.fn(), clearAccessToken: vi.fn() }
})

const user = { id: 4, name: 'Ada', email: 'ada@example.com' }

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.mocked(getAccessToken).mockReturnValue(null)
  })

  it('exposes unauthenticated state and initializes a new session once', async () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    await store.initialize()
    await store.initialize()
    expect(store.isInitialized).toBe(true)
    expect(userApi.getMe).not.toHaveBeenCalled()
  })

  it('restores an existing session by loading its profile', async () => {
    vi.stubGlobal('localStorage', window.localStorage)
    vi.mocked(getAccessToken).mockReturnValue('active-token')
    vi.mocked(userApi.getMe).mockResolvedValue(user)
    const store = useAuthStore()
    await store.initialize()
    expect(store.token).toBe('active-token')
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
    vi.unstubAllGlobals()
  })

  it('clears the persisted session and propagates errors when restoration fails', async () => {
    vi.mocked(getAccessToken).mockReturnValue('expired-token')
    vi.mocked(userApi.getMe).mockRejectedValue(new Error('expired'))
    const store = useAuthStore()
    await expect(store.initialize()).rejects.toThrow('expired')
    expect(clearAccessToken).toHaveBeenCalledOnce()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isInitialized).toBe(false)
  })

  it('persists successful login and always resets loading on failure', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ user, token: 'new-token' })
    const store = useAuthStore()
    await store.login({ email: user.email, password: 'secret' })
    expect(putAccessToken).toHaveBeenCalledWith('new-token')
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
    vi.mocked(authApi.login).mockRejectedValue(new Error('invalid credentials'))
    await expect(store.login({ email: user.email, password: 'incorrect' })).rejects.toThrow('invalid credentials')
    expect(store.isLoading).toBe(false)
  })

  it('delegates registration and resets loading if the API fails', async () => {
    vi.mocked(authApi.register).mockResolvedValue(undefined)
    const store = useAuthStore()
    await store.register({ name: user.name, email: user.email, password: 'secret' })
    expect(store.isLoading).toBe(false)
    vi.mocked(authApi.register).mockRejectedValue(new Error('duplicate email'))
    await expect(store.register({ name: user.name, email: user.email, password: 'secret' })).rejects.toThrow('duplicate email')
    expect(store.isLoading).toBe(false)
  })

  it('clears credentials after logout whether the session exists or the request fails', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
    const store = useAuthStore()
    putAccessToken('temporary')
    await store.logout()
    expect(authApi.logout).not.toHaveBeenCalled()
    store.token = 'active-token'
    store.user = user
    await store.logout()
    expect(authApi.logout).toHaveBeenCalledOnce()
    expect(store.isAuthenticated).toBe(false)
    vi.mocked(authApi.logout).mockRejectedValue(new Error('offline'))
    store.token = 'active-token'
    await expect(store.logout()).rejects.toThrow('offline')
    expect(clearAccessToken).toHaveBeenCalledTimes(3)
    expect(store.isLoading).toBe(false)
    clearAccessToken()
  })

  it('accepts an updated user from profile changes', () => {
    const store = useAuthStore()
    store.setUser(user)
    expect(store.user).toEqual(user)
  })
})
