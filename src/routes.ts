export const routes = {
  login: '/auth/login',
  register: '/auth/register',
  home: '/',
  detail: (cashFlowId: string | number) => `/cash-flows/${cashFlowId}`,
  users: '/users',
  profile: '/profile',
} as const

export const publicRoutes: string[] = [routes.login, routes.register]
