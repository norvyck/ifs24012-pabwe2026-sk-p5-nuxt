import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '~/helpers/apiHelper'
import { userApi } from './userApi'

vi.mock('~/helpers/apiHelper', () => ({ apiFetch: vi.fn() }))

describe('userApi', () => {
  beforeEach(() => vi.resetAllMocks())

  it('loads the user directory and active account profile', async () => {
    const users = [{ id: 3, name: 'Ada', email: 'ada@example.com' }]
    vi.mocked(apiFetch).mockResolvedValueOnce({ users }).mockResolvedValueOnce({ user: users[0] })
    await expect(userApi.getAll()).resolves.toEqual(users)
    await expect(userApi.getMe()).resolves.toEqual(users[0])
    expect(apiFetch).toHaveBeenNthCalledWith(1, '/users')
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/users/me')
  })

  it('saves profile updates and uploads photos as multipart form data', async () => {
    const user = { id: 2, name: 'Ada Lovelace', email: 'ada@example.com' }
    vi.mocked(apiFetch).mockResolvedValueOnce({ user })
    await expect(userApi.updateProfile({ name: user.name, email: user.email })).resolves.toEqual(user)
    expect(apiFetch).toHaveBeenNthCalledWith(1, '/users/me', {
      method: 'PUT',
      body: { name: user.name, email: user.email },
    })

    const photo = new File(['profile'], 'profile.png', { type: 'image/png' })
    vi.mocked(apiFetch).mockResolvedValueOnce({ user })
    const response = await userApi.uploadPhoto(photo)
    expect(response).toEqual({ user })
    const [path, options] = vi.mocked(apiFetch).mock.calls[1] ?? []
    expect(path).toBe('/users/me/photo')
    expect(options?.method).toBe('POST')
    expect(options?.body).toBeInstanceOf(FormData)
    expect((options?.body as FormData).get('photo')).toEqual(photo)
  })

  it('updates the account password using the documented endpoint', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    const body = {
      password: 'old-password',
      new_password: 'new-password',
      new_password_confirmation: 'new-password',
    }
    await expect(userApi.updatePassword(body)).resolves.toBeUndefined()
    expect(apiFetch).toHaveBeenCalledWith('/users/password', { method: 'PUT', body })
  })
})
