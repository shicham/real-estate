<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="card-footer"
    :class="cn('border-t-1 py-[1.125rem] px-[1.25rem]', props.class)"
  >
    <slot />
  </div>
</template>
