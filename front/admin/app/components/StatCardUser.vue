<script setup lang="ts">
import { TrendingDown, TrendingUp, TrendingUpIcon, UsersRound } from 'lucide-vue-next'
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
  title: string
  value?: number | string | null
  subtitle?: string
  trend: 'UsersRound' | 'TrendingUp' | 'TrendingDown' | 'TrendingUpIcon'
  class?: string
}>()

// Sélection automatique de l'icône
const Icon = computed(() => {
  switch (props.trend) {
    case 'TrendingUpIcon': return TrendingUpIcon
    case 'TrendingUp': return TrendingUp
    case 'TrendingDown': return TrendingDown
    default: return UsersRound // icône neutre
  }
})
const textColorClass = computed(() => {
  return {
    TrendingUp: 'text-success',
    TrendingDown: 'text-secondary',
    UsersRound: 'text-primary',
    TrendingUpIcon: 'text-warning',
  }[props.trend]
})
const bgColorClass = computed(() => {
  return {
    TrendingUp: 'bg-success',
    TrendingDown: 'bg-secondary',
    UsersRound: 'bg-primary',
    TrendingUpIcon: 'bg-warning',
  }[props.trend]
})
const fillColorClass = computed(() => {
  return {
    TrendingUp: 'fill-success',
    TrendingDown: 'fill-secondary',
    UsersRound: 'fill-primary',
    TrendingUpIcon: 'fill-warning',
  }[props.trend]
})
</script>

<template>
  <Card class="@container/card border-0 shadow-none " :class="props.class">
    <CardContent>
      <div class="mb-3">
        <Badge :class="`h-[3rem] min-w-[3rem] rounded-full px-1 ${bgColorClass}/16`">
          <component :is="Icon" :class="`!size-[1.5rem] !text-base ${fillColorClass}  ${textColorClass}`" />
        </Badge>
      </div>
      <div class="text-muted mb-2 font-medium">{{ title }}</div>
      <div class="flex items-end gap-2 flex-wrap">
        <h5 class="font-semibold mb-0 leading-none">12,235</h5>
        <div>
          <Badge
            :class="`font-semibold ${textColorClass} text-[10px] rounded-full  align-baseline mr-2 ${bgColorClass}/30`">
            <TrendingDown :class="`font-semibold ${textColorClass} text-md`" />
            2.35%
          </Badge>
          <span class="text-muted text-12">This Year</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped></style>
