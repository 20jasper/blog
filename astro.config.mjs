// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	site: 'https://jacobasper.com',
	redirects: {
		'/': '/blog',
	},
	integrations: [mdx(), sitemap(), tailwind(), compressor()],
});
