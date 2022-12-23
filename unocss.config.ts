//import type { Preset, SourceCodeTransformer } from 'unocss'
import {
  defineConfig,
  presetAttributify,
  //presetIcons,
  presetUno,
  presetWebFonts,
  //transformerDirectives,
  //transformerVariantGroup,
} from "unocss";
import presetIcons from "@unocss/preset-icons/browser";
import { presetScalpel } from "unocss-preset-scalpel";

//const presets: Preset[] = []
//const transformers: SourceCodeTransformer[] = []

export default defineConfig({
  darkMode: "class",
  shortcuts: [
    {
      "bg-base": "bg-white dark:bg-dark-100",
      "color-base": "text-gray-900 dark:text-gray-300",
      "border-base": "border-gray-200 dark:border-dark-200",
      "color-fade": "text-gray-900:50 dark:text-gray-300:50",
    },
    {
      btn: "py-2 px-4 font-semibold rounded-lg shadow-md bg-blueGray border-0 m-2 hover:op50",
      avatar: "p-1 my-2 rounded-8 bg-white op50 max-w-full h-auto"
    }, // dynamic shortcuts
    [
      /^btn-(.*)-(\d+)$/,
      ([, c, d]) => {
        let e = (parseInt(d) + 200).toString();
        return `bg-${c}-${d} hover:bg-${c}-${e} text-${c}-50 font-semibold py-2 px-4 rounded-lg`;
      },
    ],
    [
      /^btn-(.*)$/,
      ([, c]) =>
        `bg-${c}-400 hover:bg-${c}-700 text-${c}-50 font-semibold py-2 px-4 rounded-lg`,
    ],
  ],
  variants: [
    // hover:
    (matcher) => {
      if (!matcher.startsWith("hover:")) return matcher;

      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: matcher.slice(6),
        selector: (s) => `${s}:hover`,
      };
    },
  ],
  presets: [
    presetUno(),
    presetIcons({
      cdn: "https://esm.sh/",
      //collections: {
      //  carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
      //mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      //logos: () => import('@iconify-json/logos/icons.json').then(i => i.default),
      //},
      scale: 2,
      //warn: true,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetWebFonts(),
    //{
    //fonts: {
    //  sans: 'Noto Sans',
    //  serif: 'Noto Serif',
    //  mono: 'Noto Sans Mono',
    //},
    //}
    presetAttributify(),
    presetScalpel(),
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
});
