import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'
import fs from 'fs'
import Unocss from 'unocss/vite'
import { presetAttributify, presetUno, presetIcons } from 'unocss'
//import 'virtual:unocss-devtools'

const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'development',
  base: '',
  includeAssets: ['favicon.svg'],
  manifest: {
    name: 'preact_vite',
    short_name: 'PWA Router',
    theme_color: '#ffffff',
    //start_url: '/cli/',
    icons: [
      {
        src: 'pwa-192x192.png', // <== don't add slash, for testing
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png', // <== don't remove slash, for testing
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png', // <== don't add slash, for testing
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    /* when using generateSW the PWA plugin will switch to classic */
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
  //base: '',
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
  },
  plugins: [
    preact(),
    VitePWA(pwaOptions),
    replace({
      __DATE__: new Date().toISOString(),
      __RELOAD_SW__: process.env.RELOAD_SW === 'true' ? 'true' : 'false',
    }),
    Unocss({
      presets: [
        presetAttributify({ /* preset options */}),
        presetUno(),
        presetIcons({extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        }}),
      ],
      /*variants: [
      // hover:
        (matcher) => {
          if (!matcher.startsWith('hover:'))
            return matcher

          return { // slice `hover:` prefix and passed to the next variants and rules
            matcher: matcher.slice(6),
            selector: s => `${s}:hover`,
          }
        }
      ],*/
      //rules: [
      //  [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
      //  [/^p-(\d+)$/, match => ({ padding: `${match[1] / 4}rem` })],
      //],
      /*shortcuts: [
        {
          btn: 'py-2 px-4 font-semibold rounded-lg shadow-md',
        }, // dynamic shortcuts
        [/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`],
      ],*/
    }),
  ],
  server:{
    https: {
      key: fs.readFileSync(`${__dirname}/cert/privkey.pem`),
      cert: fs.readFileSync(`${__dirname}/cert/fullchain.pem`),
    },
  }
})
