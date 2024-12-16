// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import syntaxTheme from './orange-theme';

export default defineConfig({
	site: 'https://jacobasper.com',
	redirects: {
		'/': '/blog',
		'/projects/1': '/blog',
	},
	markdown: {
		shikiConfig: {
			theme: syntaxTheme,
		},
	},
	env: {
		schema: {
			GOOGLE_ANALYTICS_ID: envField.string({
				context: 'client',
				access: 'public',
			}),
		},
	},
	experimental: {
		contentIntellisense: true,
	},
	integrations: [mdx(), sitemap(), tailwind()],
});
