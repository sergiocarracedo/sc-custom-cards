import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'dist/**',
        'src/area-card/TempHumChart.ts', // ECharts wrapper, tested via integration
        'src/area-card/TempHum.ts', // Simple wrapper, tested via integration
        'src/area-card/EntityTypeStatus.ts', // Simple wrapper, tested via integration
        'src/history-bars-card/EntityBar.ts', // Component tested via parent card
        'src/components/**', // Simple wrapper components
        'src/echarts-wrapper.ts', // ECharts wrapper
        'src/action-handler-directive.ts', // External directive
        'src/utils.ts', // Simple utility functions
        'src/area-colors.ts', // Constants only
        'src/index.ts', // Entry point, no logic
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
