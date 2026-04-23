/// <reference types="vitest" />
import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type UserConfig } from 'vite'
import { builtinModules } from 'module'
import { spawnSync } from 'node:child_process'
import { config as loadEnv } from 'dotenv'
import { gzipSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

loadEnv()

if (existsSync('.env.local')) {
  loadEnv({ path: '.env.local', override: true })
}

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string
}
const buildTimestamp = new Date().toISOString()

const allExternal = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)]

function getHASyncTarget() {
  return process.env.HA_SYNC_TARGET ?? process.env.HA_SCP_TARGET
}

function copyFileToHA(localPath: string, remotePath: string) {
  const result = spawnSync('scp', [localPath, remotePath], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`Failed to copy ${localPath} to Home Assistant: ${remotePath}`)
  }
}

function copyToHA() {
  let enabled = true
  const syncTarget = getHASyncTarget()
  const isCI = process.env.CI === 'true'

  return {
    name: 'copy-to-ha',
    description: 'Copy files to Home Assistant',
    config(config: UserConfig, { command }: { command: string }) {
      if (syncTarget && command !== 'build' && !config.build?.watch) {
        console.warn(
          'The copy-to-ha plugin can only be used in "build" mode and "watch". Skipping...',
        )
        enabled = false
        return
      }

      if (syncTarget) {
        console.log(`Copying files to Home Assistant enabled...: ${syncTarget}`)
      }
    },
    closeBundle: async () => {
      if (!enabled || !syncTarget || isCI) {
        return
      }

      const bundlePath = 'dist/sc-custom-cards.js'
      const gzipPath = `${bundlePath}.gz`
      writeFileSync(gzipPath, gzipSync(readFileSync(bundlePath)))

      console.log('Copying files to Home Assistant...')

      copyFileToHA(bundlePath, syncTarget)
      copyFileToHA(gzipPath, `${syncTarget}.gz`)

      console.log('Files copied to Home Assistant.')
    },
  }
}

export default defineConfig({
  define: {
    'process.env': {},
    __SC_CUSTOM_CARDS_VERSION__: JSON.stringify(packageJson.version),
    __SC_CUSTOM_CARDS_BUILD_DATE__: JSON.stringify(buildTimestamp),
  },
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
