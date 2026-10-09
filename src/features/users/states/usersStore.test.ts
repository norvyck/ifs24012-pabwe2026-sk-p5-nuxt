import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { userApi } from '~/features/users/api/userApi'
import { useAuthStore } from '~/features/auth/states/authStore'
import { useUsersStore } from './usersStore'

vi.mock('~/features/users/api/userApi', () => ({
  userApi: {
    getAll: vi.fn(), getMe: vi.fn(), updateProfile: vi.fn(), uploadPhoto: vi.fn(), updatePassword: vi.fn(),
  },
}))

const users = [{ id: 5, name: 'Ada', email: 'ada@example.com' }]

describe('useUsersStore', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.resetAllMocks() })

  it('loads the directory and resets loading if the API fails', async () => {
    vi.mocked(userApi.getAll).mockResolvedValue(users)
    const store = useUsersStore()
    await store.fetchUsers()
    expect(store.users).toEqual(users)
    expect(store.isLoading).toBe(false)
    vi.mocked(userApi.getAll).mockRejectedValue(new Error('offline'))
    await expect(store.fetchUsers()).rejects.toThrow('offline')
    expect(store.isLoading).toBe(false)
  })

  it('updates the active user with the saved profile', async () => {
    vi.mocked(userApi.updateProfile).mockResolvedValue(users[0]!)
    const auth = useAuthStore()
    const updated = await useUsersStore().updateProfile({ name: 'Ada', email: users[0]!.email })
    expect(auth.user).toEqual(updated)
    expect(userApi.updateProfile).toHaveBeenCalledWith({ name: 'Ada', email: users[0]!.email })
  })

  it('refreshes the active profile after uploading a photo', async () => {
    vi.mocked(userApi.uploadPhoto).mockResolvedValue({ user: users[0] })
    const auth = useAuthStore()
    await useUsersStore().uploadPhoto(new File(['image'], 'avatar.png'))
    expect(userApi.uploadPhoto).toHaveBeenCalledOnce()
    expect(auth.user).toEqual(users[0])

    vi.mocked(userApi.uploadPhoto).mockResolvedValue({})
    vi.mocked(userApi.getMe).mockResolvedValue({ ...users[0]!, name: 'Ada Photo' })
    await useUsersStore().uploadPhoto(new File(['image'], 'avatar.png'))
    expect(userApi.getMe).toHaveBeenCalledOnce()
    expect(auth.user?.name).toBe('Ada Photo')
  })

  it('delegates password changes', async () => {
    vi.mocked(userApi.updatePassword).mockResolvedValue(undefined)
    const payload = { password: 'old-pass', new_password: 'new-pass', new_password_confirmation: 'new-pass' }
    await expect(useUsersStore().updatePassword(payload)).resolves.toBeUndefined()
    expect(userApi.updatePassword).toHaveBeenCalledWith(payload)
  })
})
