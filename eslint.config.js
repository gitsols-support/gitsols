// ESLint 10 flat config (root). Per-app configs extend this via `import baseConfig from '../../eslint.config.js'`.
//
// Hard rules (mirrored from CLAUDE.md):
//   - no `any`
//   - no `console.log` in committed code (warn-only here so tests/dev scripts work)
//   - prefer-const, no-unused-vars (error on unused, ignore _-prefixed)

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      '**/build/**',
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended (type-checked variant for stricter projects)
  ...tseslint.configs.recommended,

  // Project-wide language options
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // CLAUDE.md rule 6: no `any`
      '@typescript-eslint/no-explicit-any': 'error',

      // Allow _-prefixed unused args (common Express/Nest pattern)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // CLAUDE.md rule 9: no console.log in committed code
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Hygiene
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },

  // Disable formatting-only rules — prettier handles those
  prettier,
)
