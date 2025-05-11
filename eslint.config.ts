import pluginVitest from '@vitest/eslint-plugin'
import oxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import love from 'eslint-config-love'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx}'],
  },
  {
    ...love,
    files: ['**/*.js', '**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  ...oxlint.configs['flat/recommended'],
  skipFormatting,
]
