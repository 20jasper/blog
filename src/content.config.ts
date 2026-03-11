import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

export const blogTags = [
	'opinion',
	'career',
	'typescript',
	'javascript',
	'rust',
	'git',
	'go',
	'traffic design',
	'math',
] as const;

const blogTagSchema = z.enum(blogTags);

const blogSchema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	tags: z.array(blogTagSchema),
	updatedDate: z.coerce.date().optional(),
	math: z.boolean().optional(),
});

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: blogSchema,
});

const bookSchema = z.object({
	title: z.string(),
	readDate: z.object({
		start: z.coerce.date().nullable(),
		end: z.coerce.date().nullable(),
	}),
	author: z.string(),
	rating: z.number().min(0).max(5).nullable(),
});

const book = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/book' }),
	schema: bookSchema,
});

export type Book = z.infer<typeof bookSchema>;
export type Blog = z.infer<typeof blogSchema>;
export type BlogTag = (typeof blogTags)[number];

export const collections = { blog, book };
