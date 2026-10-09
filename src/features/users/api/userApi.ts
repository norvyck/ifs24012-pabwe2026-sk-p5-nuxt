import { apiFetch } from '~/helpers/apiHelper'
import type { PasswordUpdate, ProfileUpdate, User } from '~/features/users/types'

export const userApi = {
  async getAll(): Promise<User[]> {
    const response = await apiFetch<{ users: User[] }>('/users')
    return response.users
  },
  async getMe(): Promise<User> {
    const response = await apiFetch<{ user: User }>('/users/me')
    return response.user
  },
  async updateProfile(payload: ProfileUpdate): Promise<User> {
    const response = await apiFetch<{ user: User }>('/users/me', { method: 'PUT', body: payload })
    return response.user
  },
  uploadPhoto(photo: File): Promise<{ user?: User }> {
    const body = new FormData()
    body.append('photo', photo)
    return apiFetch('/users/me/photo', { method: 'POST', body })
  },
  async updatePassword(payload: PasswordUpdate): Promise<void> {
    await apiFetch('/users/password', { method: 'PUT', body: payload })
  },
}
