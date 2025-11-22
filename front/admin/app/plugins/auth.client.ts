export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  // Initialize auth state from localStorage on app load
  if (import.meta.client) {
    await authStore.initializeAuth()
  }
})
