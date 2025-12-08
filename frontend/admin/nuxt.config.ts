import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  ssr: false,
  typescript: { strict: true },
  app: { head: { title: 'Real Estate - Admin' } }
})
