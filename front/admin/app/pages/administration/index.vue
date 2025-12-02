<script setup lang="ts">
import NumberFlow from '@number-flow/vue'
import { TrendingDown, TrendingUp, TrendingUpIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()

const {
  stats,
  monthlyRegistrations,
  topAgencies,
  activityLog,
  recentUsers,
  loading,
  fetchDashboard,
} = useDashboard()

const filters = ref({
  search: '',
  role: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  city: '',
  page: 1,
  perPage: 10,
})
const totalUsers = computed(() => stats.value.totalUsers)

onMounted(() => {
  fetchDashboard(filters.value)
})

function onFiltersUpdated(newFilters: any) {
  filters.value = { ...filters.value, ...newFilters, page: 1 }
  fetchDashboard(filters.value)
}

function onPageChange(page: number) {
  filters.value.page = page
  fetchDashboard(filters.value)
}

const dataCard = ref({
  totalRevenue: 0,
  newCustomers: 0,
  activeAccount: 0,
  growthRate: 0,
})

onMounted(() => {
  dataCard.value = {
    totalRevenue: 43038,
    newCustomers: 28346,
    activeAccount: 129368,
    growthRate: 35367,
  }
})

const timeRange = ref('30d')

const isDesktop = useMediaQuery('(min-width: 768px)')
watch(isDesktop, () => {
  if (isDesktop.value) {
    timeRange.value = '30d'
  }
  else {
    timeRange.value = '7d'
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        {{ t('nav.administration') }}
      </h2>
      <div class="flex items-center space-x-2">
        <BaseDateRangePicker />
        <Button>Download</Button>
      </div>
    </div>
    <main class="@container/main flex flex-1 flex-col gap-4 md:gap-8">
      <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        <!-- CARD 1 -->
        <div class="col-span-1">
          <StatCard title="👥 Total Utilisateurs" :value="totalUsers" subtitle="Comptes enregistrés" />
        </div>

        <!-- CARD 2 -->
        <div class="col-span-1">

        </div>

        <!-- CARD 3 -->
        <div class="col-span-1">

        </div>
      </div>

    </main>
  </div>
</template>
