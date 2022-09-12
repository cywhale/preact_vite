import { defineConfig } from 'vite'
import { resolve } from 'path'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'
import fs from 'fs'
import Unocss from 'unocss/vite'
//import 'virtual:unocss-devtools'
import Manifest from './src/assets/manifest.json'

const isProd = process.env.NODE_ENV === "production"

const pwaOptions: Partial<VitePWAOptions> = {
  includeAssets: ['favicon.svg'],
  manifest: Manifest,
  devOptions: {
    enabled: process.env.SW_DEV === 'true' && !isProd,
    // when using generateSW the PWA plugin will switch to classic
    type: 'module',
    navigateFallback: 'index.html',
  },
}

const replaceOptions = { __DATE__: new Date().toISOString() }
const claims = process.env.CLAIMS === 'true'
const reload = process.env.RELOAD_SW === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src'
  pwaOptions.filename = claims ? 'claims-sw.ts' : 'prompt-sw.ts'
  pwaOptions.strategies = 'injectManifest'
  ;(pwaOptions.manifest as Partial<ManifestOptions>).name = 'PWA Inject Manifest'
  ;(pwaOptions.manifest as Partial<ManifestOptions>).short_name = 'PWA Inject'
}

if (claims)
  pwaOptions.registerType = 'autoUpdate'

if (reload) {
  // @ts-expect-error just ignore
  replaceOptions.__RELOAD_SW__ = 'true'
}

if (selfDestroying)
  pwaOptions.selfDestroying = selfDestroying


// https://vitejs.dev/config/
export default defineConfig({
  //root: './',
  base: '/cli/',
  //publicDir: './cli/public',
  mode: isProd? "production" : "development",
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true' || !isProd,
    manifest: true,
    outDir: resolve(__dirname, './dist/cli/'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
    //  cli: resolve(__dirname, 'index.html'),
      }
    }
  },
  define: {
    'process.env': process.env
  },
  resolve: {
  //fallback: resolve(__dirname, 'src'),
    extensions: ['.js', '.jsx', 'ts', 'tsx'],
    mainFields: ['module'],
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react/jsx-runtime": "preact/jsx-runtime",
    }
  },
  plugins: [
    Unocss(),
    preact(),
    VitePWA(pwaOptions),
    replace({
      __DATE__: new Date().toISOString(),
      __RELOAD_SW__: process.env.RELOAD_SW === 'true' ? 'true' : 'false',
    }),
  ],
  server:{
    //watch: {
    //    usePolling: isProd? false : true,
    //},
    //hmr: {clientPort: 3006, host:'localhost'},
    https: {
      key: fs.readFileSync(`${__dirname}/cert/privkey.pem`),
      cert: fs.readFileSync(`${__dirname}/cert/fullchain.pem`),
    },
  }
})
