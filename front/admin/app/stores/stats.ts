import { defineStore } from 'pinia'

export interface Stats {
  userRegistered: number
  userLogin: number
  userLogout: number
  emailVerified: number
  passwordResetRequested: number
  passwordResetCompleted: number
  failedLoginAttempt: number
  suspiciousActivity: number
  apiCall: number
  errorOccurred: number
  total: number
}

export interface StatsState {
  stats: Stats | null
  isLoading: boolean
  startDate: Date
  endDate: Date
  eventType: string
}

export const useStatsStore = defineStore('stats', {
  state: (): StatsState => {
    const today = new Date()
    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    // startDate = aujourd'hui - 20 jours
    const start = new Date(today)
    start.setDate(start.getDate() - 20)

    return {
      data: null,
      isLoading: false,
      startDate: formatDate(start),
      endDate: formatDate(today),
      eventType: '',
    }
  },
  getters: {
    getStats: state => state.stats,
    getStartDate: state => state.startDate,
    getEndDate: state => state.endDate,
    getEventType: state => state.eventType,
  },

  actions: {
    async getStatsRange(startDate: string, endDate: string, eventType: string) {
      this.isLoading = true
      const config = useRuntimeConfig()
      const API_URL = `${config.public.apiStatsBaseUrl}${config.public.apiStatsRangeEndpoint}`
      console.log("API_URL", API_URL)
      try {
        const { data, error } = await useFetch(API_URL, {
          method: 'POST',
          body: { startDate, endDate, eventType },
          headers: { 'Content-Type': 'application/json' },
        })
        if (error.value || !data.value) {
          throw new Error(error.value?.data?.message || 'Erreur de connexion au serveur.')
        }

        const response = data.value as {
          success: boolean
          message: string
          data?: {
            stats: Stats
          }
        }

        if (!response.success) {
          throw new Error(response.message || 'incorrects.')
        }

        if (!response.data) {
          throw new Error('Réponse inattendue du serveur.')
        }

        // Update store state
        this.stats = response.data


        return { success: true }
      }
      catch (err: any) {
        return { success: false, error: err.message || 'Une erreur est survenue.' }
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
