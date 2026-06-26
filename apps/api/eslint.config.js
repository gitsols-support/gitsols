// API app ESLint config — extends root + relaxes rules for NestJS decorator patterns.

import baseConfig from '../../eslint.config.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // NestJS decorators rely on parameter properties; allow them.
      '@typescript-eslint/parameter-properties': 'off',

      // class-validator DTOs commonly export classes that look "empty"; quiet that pattern.
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
]
