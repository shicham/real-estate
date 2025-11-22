import { watch } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  // Nuxt i18n registers $i18n on nuxtApp
  // Access the composition API global locale ref
  const i18n = (nuxtApp as any).$i18n
  if (!i18n || !i18n.global || !i18n.global.locale)
    return

  const setDir = (loc: string) => {
    if (import.meta.client) {
      document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr'
    }
  }

  // Set initial direction
  setDir(i18n.global.locale.value)

  // Watch locale changes and update dir
  watch(() => i18n.global.locale.value, (newLocale: string) => {
    setDir(newLocale)
  })
})
