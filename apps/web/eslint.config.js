// Admin app ESLint config — extends root + adds Next.js + React rules.

import baseConfig from '../../eslint.config.js'
import nextPlugin from '@next/eslint-plugin-next'
import globals from 'globals'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
]
