// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pixelm.bitcreative.cc',
  // GitHub Pages serves /manual/index.html and 301s /manual to http://…/manual/; link the canonical form directly.
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});
