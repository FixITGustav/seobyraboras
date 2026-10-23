import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://seobyraboras.se',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: {
    inlineStylesheets: 'auto',
  },
});
