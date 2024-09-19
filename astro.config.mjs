// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import syntaxTheme from './orange-theme';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.jacobasper.com',
	redirects: {
		'/': '/blog',
	},
	markdown: {
		shikiConfig: {
			theme: syntaxTheme,
		},
	},
	experimental: {
		contentIntellisense: true,
	},
	integrations: [mdx(), sitemap(), tailwind()],
});
