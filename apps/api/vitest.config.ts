/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    name: '@gitsols/api',
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@gitsols/types': resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
  esbuild: {
    // NestJS relies on emitted decorator metadata. esbuild doesn't emit it
    // natively; for unit tests at the controller/service level we don't need
    // DI metadata, but keep this here as a marker if you start hitting
    // decorator-related test failures and need to swap to SWC.
    target: 'es2022',
  },
})
