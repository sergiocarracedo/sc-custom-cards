import pluginVitest from "@vitest/eslint-plugin";
import oxlint from "eslint-plugin-oxlint";
import love from "eslint-config-love";

export default [
  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{js,ts,mts,tsx}'],
  },
  {
    ...love,
    files: ['src/**/*.js', 'src/**/*.ts'],
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
]
