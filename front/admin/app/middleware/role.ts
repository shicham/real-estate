export default defineNuxtRouteMiddleware((to, _from) => {
  const authStore = useAuthStore()

  // Check if route requires specific role
  const requiredRole = to.meta.requiredRole as string | undefined
  const requiredPermission = to.meta.requiredPermission as string | undefined

  if (requiredRole && !authStore.hasRole(requiredRole)) {
    // User doesn't have required role
    return navigateTo('/403')
  }

  if (requiredPermission && !authStore.checkPermission(requiredPermission)) {
    // User doesn't have required permission
    return navigateTo('/403')
  }
})
