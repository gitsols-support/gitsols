/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: '@gitsols/web',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@gitsols/types': resolve(__dirname, '../../packages/types/src/index.ts'),
      '@gitsols/constants': resolve(__dirname, '../../packages/constants/src/index.ts'),
      '@gitsols/utils': resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
})
