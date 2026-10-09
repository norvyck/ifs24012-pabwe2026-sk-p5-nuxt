import { apiFetch } from '~/helpers/apiHelper'
import type { User } from '~/features/users/types'

export type Credentials = { email: string; password: string }
export type RegisterPayload = Credentials & { name: string }
export type AuthResponse = { user: User; token: string }

export const authApi = {
  login(payload: Credentials): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: payload, token: null })
  },
  async register(payload: RegisterPayload): Promise<void> {
    await apiFetch<undefined>('/auth/register', { method: 'POST', body: payload, token: null })
  },
  logout(): Promise<unknown> {
    return apiFetch('/auth/logout', { method: 'POST' })
  },
}
