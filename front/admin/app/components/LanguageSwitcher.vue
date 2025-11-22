<script setup lang="ts">
import { useNuxtApp } from '#app'
import { ref } from 'vue'

const nuxtApp = useNuxtApp()
const i18n = (nuxtApp as any).$i18n
const locale = ref(i18n?.global?.locale?.value || 'en')

function setLocale(l: string) {
  if (!i18n)
    return
  i18n.global.locale.value = l
  if (import.meta.client) {
    localStorage.setItem('locale', l)
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
  }
  locale.value = l
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button class="px-2 py-1" :class="{ 'font-semibold': locale === 'en' }" @click="setLocale('en')">
      EN
    </button>
    <button class="px-2 py-1" :class="{ 'font-semibold': locale === 'fr' }" @click="setLocale('fr')">
      FR
    </button>
    <button class="px-2 py-1" :class="{ 'font-semibold': locale === 'ar' }" @click="setLocale('ar')">
      AR
    </button>
  </div>
</template>
