<script setup lang="ts">
import { defineProps } from 'vue'
import { TrendingDown, TrendingUp, TrendingUpIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const statsStore = useStatsStore()
// Form state
const userRegistered = ref('')
const emailVerified = ref('')
const suspiciousActivity = ref('')
const apiCall = ref('')
// Call Api
const result = await statsStore.getStatsRange(
  new Date(),
  '',
  '',
)
 console.log("resultresultresult", statsStore.getStats)
</script>

<template>
  <Card class="@container/card">
    <CardContent class="p-0">
      <div class="grid grid-cols-2 gap-0">
        <StatCardUser :title="'Total Employees'" :trend="'UsersRound'" :class="'border-b-1 border-r-1'"></StatCardUser>
        <StatCardUser :title="'New Employees'" :trend="'TrendingUp'" :class="'border-b-1'"></StatCardUser>
        <StatCardUser :title="'Total Job Applicants'" :trend="'TrendingDown'" :class="'border-r-1'"></StatCardUser>
        <StatCardUser :title="'Resigned Employees'" :trend="'TrendingUpIcon'" :class="'border-r-0'"></StatCardUser>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped></style>
