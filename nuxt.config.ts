import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  srcDir: 'src/',
  ssr: false,
  nitro: {
    externals: {
      inline: ['nuxt'],
    },
  },
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      delcomBaseUrl:
        process.env.VITE_DELCOM_BASEURL ??
        process.env.DELCOM_BASEURL ??
        'https://open-api.delcom.org/api/v1',
    },
  },
  app: {
    head: {
      title: 'Delcom Cash Flow — Kelola keuangan dengan lebih tenang',
      htmlAttrs: { lang: 'id' },
      meta: [
        {
          name: 'description',
          content: 'Dashboard pencatatan arus kas Delcom yang sederhana dan mudah digunakan.',
        },
        { name: 'theme-color', content: '#f7f8fc' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
})
