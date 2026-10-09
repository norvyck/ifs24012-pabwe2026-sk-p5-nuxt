import { defineStore } from 'pinia'
import { useAuthStore } from '~/features/auth/states/authStore'
import { userApi } from '~/features/users/api/userApi'
import type { PasswordUpdate, ProfileUpdate, User } from '~/features/users/types'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    isLoading: false,
  }),
  actions: {
    async fetchUsers(): Promise<void> {
      this.isLoading = true
      try {
        this.users = await userApi.getAll()
      } finally {
        this.isLoading = false
      }
    },
    async updateProfile(payload: ProfileUpdate): Promise<User> {
      const user = await userApi.updateProfile(payload)
      const authStore = useAuthStore()
      authStore.setUser(user)
      return user
    },
    async uploadPhoto(photo: File): Promise<void> {
      const response = await userApi.uploadPhoto(photo)
      if (response.user) useAuthStore().setUser(response.user)
      else useAuthStore().setUser(await userApi.getMe())
    },
    updatePassword(payload: PasswordUpdate): Promise<void> {
      return userApi.updatePassword(payload)
    },
  },
})
