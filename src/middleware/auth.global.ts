import { routes, publicRoutes } from '~/routes'
import { useAuthStore } from '~/features/auth/states/authStore'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return
  const auth = useAuthStore()
  try {
    await auth.initialize()
  } catch (error) {
    console.error('Gagal memulihkan sesi pengguna:', error)
  }

  if (publicRoutes.includes(to.path) && auth.isAuthenticated) {
    return navigateTo(routes.home, { replace: true })
  }
  if (!publicRoutes.includes(to.path) && !auth.isAuthenticated) {
    return navigateTo(routes.login, { replace: true })
  }
})
