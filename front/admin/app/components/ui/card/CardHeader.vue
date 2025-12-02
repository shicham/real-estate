<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="card-header"
    :class="cn('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 py-[1.125rem] px-[1.25rem] border-b-1 border-b-border has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 flex flex-wrap', props.class)"
  >
    <slot />
  </div>
</template>
