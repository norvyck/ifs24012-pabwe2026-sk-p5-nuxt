import { defineStore } from 'pinia'
import { clearAccessToken, getAccessToken, putAccessToken } from '~/helpers/apiHelper'
import { authApi, type Credentials, type RegisterPayload } from '~/features/auth/api/authApi'
import { userApi } from '~/features/users/api/userApi'
import type { User } from '~/features/users/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
    isLoading: false,
    isInitialized: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async initialize(): Promise<void> {
      if (this.isInitialized || typeof window === 'undefined') return
      this.token = getAccessToken()
      if (this.token) {
        try {
          this.user = await userApi.getMe()
        } catch (error) {
          clearAccessToken()
          this.token = null
          this.user = null
          throw error
        }
      }
      this.isInitialized = true
    },
    async login(credentials: Credentials): Promise<void> {
      this.isLoading = true
      try {
        const response = await authApi.login(credentials)
        putAccessToken(response.token)
        this.token = response.token
        this.user = response.user
        this.isInitialized = true
      } finally {
        this.isLoading = false
      }
    },
    async register(payload: RegisterPayload): Promise<void> {
      this.isLoading = true
      try {
        await authApi.register(payload)
      } finally {
        this.isLoading = false
      }
    },
    async logout(): Promise<void> {
      this.isLoading = true
      try {
        if (this.token) await authApi.logout()
      } finally {
        clearAccessToken()
        this.token = null
        this.user = null
        this.isInitialized = true
        this.isLoading = false
      }
    },
    setUser(user: User): void {
      this.user = user
    },
  },
})
