//import type { Preset, SourceCodeTransformer } from 'unocss'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  //transformerDirectives,
  //transformerVariantGroup,
} from 'unocss'

//const presets: Preset[] = []
//const transformers: SourceCodeTransformer[] = []

export default defineConfig({
  shortcuts: [{
    'bg-base': 'bg-gray-100 dark:bg-dark',
    'bg-base-second': 'bg-white dark:bg-dark-100',
    'color-base': 'text-gray-700 dark:text-white/80',
    'color-base-second': 'text-gray-400 dark:text-gray-500/50',
    'border-base': 'border border-gray-200 dark:border-gray/50',
    'bg-primary': 'bg-light-blue-500 dark:bg-light-blue-600/80',
    },
    {
      btn: 'py-2 px-4 font-semibold rounded-lg shadow-md',
    }, // dynamic shortcuts
    [/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`],
  ],
  variants: [
      // hover:
        (matcher) => {
          if (!matcher.startsWith('hover:'))
            return matcher

          return { // slice `hover:` prefix and passed to the next variants and rules
            matcher: matcher.slice(6),
            selector: s => `${s}:hover`,
          }
        }
  ],
  presets: [
    presetUno(),
    presetIcons({
      //scale: 1.2,
      //warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWebFonts(
      //{
        //fonts: {
        //  sans: 'Noto Sans',
        //  serif: 'Noto Serif',
        //  mono: 'Noto Sans Mono',
        //},
      //}
    ),
    presetAttributify(),
    //...presets,
  ],
  //transformers: [
  //  transformerDirectives(),
  //  transformerVariantGroup(),
    //...transformers,
  //],
  //rules: [
    //  [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
    //  [/^p-(\d+)$/, match => ({ padding: `${match[1] / 4}rem` })],
    //['p-safe', { padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' }],
    //['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    //['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  //],
})
