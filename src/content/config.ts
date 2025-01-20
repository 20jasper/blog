import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		math: z.boolean().optional(),
	}),
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
	type: 'content',
	schema: bookSchema,
});

export type Book = z.infer<typeof bookSchema>;

export const collections = { blog, book };
