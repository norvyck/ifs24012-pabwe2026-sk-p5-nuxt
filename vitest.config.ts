import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/helpers/**/*.ts', 'src/hooks/**/*.ts', 'src/features/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/types.ts'],
      reporter: ['text', 'json', 'json-summary'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
