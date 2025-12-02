import { ref } from 'vue'

interface Stat {
  totalUsers: number
  professionals: number
  individuals: number
  pending: number
  suspended: number
  incompleteProfiles: number
  newLast24h: number
}

interface Monthly { label: string, value: number }
interface Agency { id: string, name: string, listings: number, visits: number }
interface Log { title: string, by: string, role: string, date: string }
interface User { id: string, name: string, type: string, status: string, date: string, email?: string, phone?: string }

const stats = ref<Stat>({
  totalUsers: 12540,
  professionals: 3120,
  individuals: 9420,
  pending: 184,
  suspended: 32,
  incompleteProfiles: 450,
  newLast24h: 35,
})

const monthlyRegistrations = ref<Monthly[]>([
  { label: 'Déc', value: 820 },
  { label: 'Jan', value: 700 },
  { label: 'Fev', value: 650 },
  { label: 'Mar', value: 900 },
  { label: 'Avr', value: 1100 },
  { label: 'Mai', value: 980 },
  { label: 'Juin', value: 1200 },
  { label: 'Juil', value: 760 },
  { label: 'Aoû', value: 830 },
  { label: 'Sep', value: 910 },
  { label: 'Oct', value: 1000 },
  { label: 'Nov', value: 1150 },
])

const topAgencies = ref<Agency[]>([
  { id: 'a1', name: 'Agence ABC', listings: 320, visits: 12400 },
  { id: 'a2', name: 'Agence Nova', listings: 280, visits: 9800 },
  { id: 'a3', name: 'ImmoPlus', listings: 210, visits: 8300 },
])

const activityLog = ref<Log[]>([
  { title: 'Nouvelle annonce publiée', by: 'Agence ABC', role: 'pro', date: new Date().toISOString() },
  { title: 'Compte validé', by: 'Jean Dupont', role: 'particulier', date: new Date(Date.now() - 3600e3).toISOString() },
  { title: 'Profil modifié', by: 'ImmoPlus', role: 'pro', date: new Date(Date.now() - 7200e3).toISOString() },
])

const recentUsers = ref<User[]>([
  { id: 'u1', name: 'Jean Dupont', type: 'Particulier', status: 'En attente', date: '2025-11-27', email: 'jean@example.com' },
  { id: 'u2', name: 'Agence ABC', type: 'Pro', status: 'Validé', date: '2025-11-26', email: 'contact@agence-abc.com' },
  { id: 'u3', name: 'Alice Martin', type: 'Particulier', status: 'Actif', date: '2025-11-25', email: 'alice@example.com' },
  // ajoute d'autres users mock si besoin
])

const loading = ref(false)

export function useDashboard() {
  async function fetchDashboard(filters: any = {}) {
    loading.value = true
    // Ici, remplace par un appel API réel (axios/fetch). On simule un délai.
    await new Promise(r => setTimeout(r, 250))

    // Exemple : on pourrait filtrer recentUsers selon filters (search, role, status, date range, city)
    // Pour le mock on renvoie la liste complète (mais ci-dessous un petit filtre search)
    let result = [...recentUsers.value]
    const s = filters.search?.toString().trim().toLowerCase()
    if (s && s.length > 0) {
      result = result.filter(u => (`${u.name} ${u.email || ''}`).toLowerCase().includes(s))
    }
    // applique d'autres filtres de démonstration
    if (filters.role && filters.role !== 'all') {
      result = result.filter(u => u.type.toLowerCase().includes(filters.role))
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(u => u.status.toLowerCase().includes(filters.status))
    }
    // pagination simple (server-side remplacer par backend)
    const p = filters.page ?? 1
    const per = filters.perPage ?? 10
    const start = (p - 1) * per
    recentUsers.value = result.slice(0, 200) // conserve local pool

    loading.value = false
  }

  return {
    stats,
    monthlyRegistrations,
    topAgencies,
    activityLog,
    recentUsers,
    loading,
    fetchDashboard,
  }
}
