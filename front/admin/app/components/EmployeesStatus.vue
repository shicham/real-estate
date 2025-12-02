<script setup lang="ts">
import { defineProps } from 'vue'
import { TrendingDown, TrendingUp, TrendingUpIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
  title: string
  value: number | string | null
  subtitle?: string
}>()
</script>

<template>
  <div class="col-span-1">
    <div class="border rounded-2xl shadow-sm bg-white p-5">
      <p class="text-muted-foreground text-sm mb-2">Status des Comptes</p>
      <!-- Barre de progression -->
      <div class="flex w-full overflow-hidden rounded-lg h-4 mb-4">
        <div class="w-[25%] bg-primary/60"></div>
        <div class="w-[35%] bg-green-500/70"></div>
        <div class="w-[25%] bg-yellow-500/70"></div>
        <div class="w-[15%] bg-red-500/70"></div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="flex justify-between"><span>Actifs :</span> <span>4075</span></div>
        <div class="flex justify-between"><span>En attente :</span> <span>5775</span></div>
        <div class="flex justify-between"><span>Inactifs :</span> <span>3976</span></div>
        <div class="flex justify-between"><span>Bloqués :</span> <span>1675</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
