// @ts-check
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import { select } from 'hast-util-select';

import fs from 'fs';

const path =
	'./dist/blog/detail-oriented-i-will-atomize-your-resume/index.html';
const file = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });

import HTMLParser from 'node-html-parser';
const root = HTMLParser.parse(file);

const article = root.querySelector('article > div');

// make paths relative to curr folder
article?.querySelectorAll('img').forEach((x) => {
	if (x.getAttribute('src').startsWith('/')) {
		x.setAttribute('src', `.${x.getAttribute('src')}`);
	}
});

// remove div with h1
article?.querySelector('div')?.remove();

import prettier from 'prettier';

// remark does not like extra whitespace
const articlePretty = await prettier.format(article?.innerHTML, {
	parser: 'html',
});

const markdown = unified()
	.use(remarkParse)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeSanitize, {
		clobberPrefix: '',
	})
	.use(rehypeStringify)
	.processSync(articlePretty)
	.toString();
const markdownPretty = await prettier.format(markdown, { parser: 'html' });

const markdownNoNewLines = markdownPretty
	.split('\n')
	.filter((x) => x.length)
	.join('\n');

fs.writeFileSync(
	'./dist/blog/detail-oriented-i-will-atomize-your-resume/index.md',
	markdownNoNewLines,
);
