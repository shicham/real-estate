export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/login', '/register', '/forgot-password', '/otp']
  if (publicPaths.some(p => to.path.startsWith(p)))
    return

  const accessToken = useCookie('accessToken').value
  const authStore = useAuthStore()

  if (!accessToken) {
    // Pas de token : tenter refresh via endpoint serveur
    const refreshed = await authStore.refreshAccessToken()
    if (!refreshed) {
      return navigateTo('/login')
    }
    return
  }

  // Si on a un token mais pas d'info user, initialise le store
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  }
})
