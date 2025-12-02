import { defineStore } from 'pinia'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
  permissions?: string[]
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    isAdmin: state => state.user?.role === 'admin',
    hasPermission: state => (permission: string) => {
      return state.user?.permissions?.includes(permission) || false
    },
    userInitials: (state) => {
      if (!state.user?.name)
        return ''
      const names = state.user.name.split(' ')
      return names.map(n => n[0]).join('').toUpperCase()
    },
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      const config = useRuntimeConfig()
      const API_URL = `${config.public.apiBaseUrl}${config.public.apiLoginEndpoint}`

      try {
        const { data, error } = await useFetch(API_URL, {
          method: 'POST',
          body: { email, password },
          headers: { 'Content-Type': 'application/json' },
        })

        if (error.value || !data.value) {
          throw new Error(error.value?.data?.message || 'Erreur de connexion au serveur.')
        }

        const response = data.value as {
          success: boolean
          message: string
          data?: {
            user: User
            accessToken: string
            refreshToken: string
          }
        }

        if (!response.success) {
          throw new Error(response.message || 'Identifiants incorrects.')
        }

        if (!response.data?.accessToken) {
          throw new Error('Réponse inattendue du serveur.')
        }

        // Update store state
        this.user = response.data.user
        this.accessToken = response.data.accessToken
        this.refreshToken = response.data.refreshToken
        this.isAuthenticated = true

        // Store in Cookie 
        useCookie('accessToken').value = response.data.accessToken
        useCookie('refreshToken').value = response.data.refreshToken
        useCookie('user').value = JSON.stringify(response.data.user)

        return { success: true }
      }
      catch (err: any) {
        return { success: false, error: err.message || 'Une erreur est survenue.' }
      }
      finally {
        this.isLoading = false
      }
    },

    async register(firstName: string, lastName: string, email: string, password: string, confirmPassword: string) {
      this.isLoading = true
      const config = useRuntimeConfig()
      const API_URL = `${config.public.apiBaseUrl}${config.public.apiRegisterEndpoint}`
      try {
        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
          throw new Error('Tous les champs sont requis.')
        }

        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas.')
        }

        if (password.length < 8) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères.')
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        if (!passwordRegex.test(password)) {
          throw new Error('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.')
        }

        const { data, error } = await useFetch(API_URL, {
          method: 'POST',
          body: { firstName, lastName, email, password },
          headers: { 'Content-Type': 'application/json' },
        })

        if (error.value || !data.value) {
          throw new Error(error.value?.data?.message || 'Erreur lors de l\'inscription.')
        }

        const response = data.value as {
          success: boolean
          message: string
          data?: {
            user: User
            accessToken: string
            refreshToken: string
          }
        }

        if (!response.success) {
          throw new Error(response.message || 'Erreur lors de l\'inscription.')
        }

        if (response.data?.accessToken) {
          // Auto-login after registration
          this.user = response.data.user
          this.accessToken = response.data.accessToken
          this.refreshToken = response.data.refreshToken
          this.isAuthenticated = true

          // Store in Cookie 
          useCookie('accessToken').value = response.data.accessToken
          useCookie('refreshToken').value = response.data.refreshToken
          useCookie('user').value = JSON.stringify(response.data.user)
        }

        return { success: true, message: response.message }
      }
      catch (err: any) {
        return { success: false, error: err.message || 'Une erreur est survenue.' }
      }
      finally {
        this.isLoading = false
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        return false
      }

      const config = useRuntimeConfig()
      const API_URL = `${config.public.apiBaseUrl}/api/v1/auth/refresh`

      try {
        const { data, error } = await useFetch(API_URL, {
          method: 'POST',
          body: { refreshToken: this.refreshToken },
          headers: { 'Content-Type': 'application/json' },
        })

        if (error.value || !data.value) {
          this.logout()
          return false
        }

        const response = data.value as {
          success: boolean
          data?: {
            accessToken: string
          }
        }

        if (response.success && response.data?.accessToken) {
          this.accessToken = response.data.accessToken
          if (import.meta.client) {
            localStorage.setItem('accessToken', response.data.accessToken)
          }
          return true
        }

        this.logout()
        return false
      }
      catch {
        this.logout()
        return false
      }
    },

    async logout() {
      try {
        const config = useRuntimeConfig()
        const API_URL = `${config.public.apiBaseUrl}/api/v1/auth/logout`
        await useFetch(API_URL, { method: 'POST' })
      }
      finally {
        useCookie('accessToken').value = null
        useCookie('refreshToken').value = null
        useCookie('user').value = null
        this.user = null
        this.accessToken = null
        this.refreshToken = null
        this.isAuthenticated = false
        navigateTo('/login')
      }
    },

    async initializeAuth() {
      // Lit le cookie accessToken (fonctionne en SSR et client)
      const accessToken = useCookie('accessToken').value

      if (accessToken) {
        // Si on a un token, récupère user depuis cookie ou appelle un endpoint user
        const userCookie = useCookie('user').value
        if (userCookie) {
          this.user = userCookie as User
          this.isAuthenticated = true
          return
        }

        try {
          const data = await $fetch('/api/auth/me') // endpoint serveur qui retourne user depuis token
          this.user = data.user
          this.isAuthenticated = true
        }
        catch (e) {
          // token invalide → tenter refresh
          console.error(e)
          await this.refreshAccessToken()
        }
      }
      else {
        // Pas de token : tenter refresh (refresh token est httpOnly côté serveur)
        await this.refreshAccessToken()
      }
    },

    checkPermission(permission: string): boolean {
      return this.user?.permissions?.includes(permission) || false
    },

    hasRole(role: string): boolean {
      return this.user?.role === role
    },
  },
})
