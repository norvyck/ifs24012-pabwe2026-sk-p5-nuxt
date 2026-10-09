import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0, left: 0, behavior: 'smooth' }
  },
}
