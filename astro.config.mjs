// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import syntaxTheme from './orange-theme';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
	site: 'https://jacobasper.com',
	redirects: {
		'/': '/blog',
		'/projects/1': '/blog',
	},
	markdown: {
		shikiConfig: {
			theme: syntaxTheme,
			wrap: true,
		},
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
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
