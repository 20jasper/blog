// oxlint-disable import/max-dependencies -- config files naturally accumulate one import per integration/plugin
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import inline from '@playform/inline';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';
import syntaxTheme from './orange-theme';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { unified } from '@astrojs/markdown-remark';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

// remark-math marks block formulas with the "math-display" class before
// rehype-katex replaces them with katex's own (version-specific) markup;
// wrapping here keeps the scrollable, focusable container stable across
// katex upgrades instead of depending on katex's internal class names.
function rehypeWrapDisplayMath() {
	return (tree: Root) => {
		visit(tree, 'element', (node, index, parent) => {
			const classNames = node.properties?.className;
			const isDisplayMath =
				Array.isArray(classNames) && classNames.includes('math-display');
			if (!isDisplayMath || !parent || index === undefined) return;

			const wrapper: Element = {
				type: 'element',
				tagName: 'span',
				properties: { className: ['math-overflow'], tabIndex: 0 },
				children: [node],
			};
			parent.children[index] = wrapper;
		});
	};
}

function rehypeFocusableTables() {
	return (tree: Root) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'table') {
				node.properties = { ...node.properties, tabIndex: 0 };
			}
		});
	};
}

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
				rehypeWrapDisplayMath,
				rehypeKatex,
				rehypeFocusableTables,
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
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/test-fixtures/'),
		}),
		inline({ Beasties: { pruneSource: false } }),
	],
	vite: { plugins: [tailwind()] },
});
