// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

import compressor from 'astro-compressor';

// https://astro.build/config
export default defineConfig({
	site: 'https://jacobasper.com',
	redirects: {
		'/projects/[...slug]/': '/',
	},
	integrations: [mdx(), sitemap(), compressor()],
});
