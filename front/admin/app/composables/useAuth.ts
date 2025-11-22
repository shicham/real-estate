/**
 * Authentication composable - wrapper around auth store
 * @deprecated Use useAuthStore() directly instead
 */
export function useAuth() {
  const authStore = useAuthStore()
  return {
    token: computed(() => authStore.accessToken),
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    logout: () => authStore.logout(),
    login: (email: string, password: string) => authStore.login(email, password),
    register: (name: string, email: string, password: string, confirmPassword: string) =>
      authStore.register(name, email, password, confirmPassword),
  }
}
