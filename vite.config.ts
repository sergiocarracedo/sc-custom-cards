/// <reference types="vitest" />
import 'dotenv/config'
import { resolve } from 'node:path'
import { defineConfig, type UserConfig } from 'vite'
import { builtinModules } from 'module'
import { spawnSync } from 'node:child_process'

const allExternal = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)]

function copyToHA() {
  let enabled = true

  return {
    name: 'copy-to-ha',
    description: 'Copy files to Home Assistant',
    config(config: UserConfig, { command }: { command: string }) {
      if (process.env.HA_SCP_TARGET && command !== 'build' && !config.build?.watch) {
        console.warn(
          'The copy-to-ha plugin can only be used in "build" mode and "watch". Skipping...',
        )
        enabled = false
        return
      }
      if (process.env.HA_SCP_TARGET) {
        console.log(`Copying files to Home Assistant enabled...: ${process.env.HA_SCP_TARGET}`)
      }

    },
    closeBundle: async () => {
      if (!enabled || !process.env.HA_SCP_TARGET) {
        return
      }
      console.log('Copying files to Home Assistant...')
      spawnSync('scp', [
        'dist/sc-custom-cards.js',
        process.env.HA_SCP_TARGET
      ])
      console.log('Files copied to Home Assistant.')
    },
  }
}

export default defineConfig({
  // define: {
  //   'process.env': {},
  // },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [copyToHA()],
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['fsevents', ...allExternal],
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'sc-custom-cards',
    },
  },
})
