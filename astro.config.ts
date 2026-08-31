// oxlint-disable import/max-dependencies -- config files naturally accumulate one import per integration/plugin
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';
import syntaxTheme from './orange-theme';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
	site: 'https://jacobasper.com',
	redirects: {
		'/projects/1/': 'https://jacobasper.com/blog',
		'passwords.txt': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	},
	markdown: {
		shikiConfig: {
			theme: syntaxTheme,
			wrap: true,
		},
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'append',
						properties: {
							className: ['heading-anchor'],
							ariaLabel: 'Link to this heading',
						},
						content: { type: 'text', value: '#' },
					},
				],
				rehypeKatex,
				[
					rehypeExternalLinks,
					{
						rel: ['noopener', 'noreferrer'],
						target: '_blank',
						properties: { class: 'link-external' },
					},
				],
			],
		}),
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
	integrations: [mdx(), sitemap()],
	vite: { plugins: [tailwind()] },
});
