import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  ssr: true,
  typescript: { strict: true },
  app: { head: { title: 'Real Estate - Site' } }
})
