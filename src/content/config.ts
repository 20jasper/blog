import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

const bookSchema = z.object({
	title: z.string(),
	readDate: z.object({
		start: z.coerce.date(),
		end: z.coerce.date().nullable(),
	}),
	author: z.string(),
	articleWriteDate: z.coerce.date(),
	rating: z.number().min(0).max(5).nullable(),
});

const book = defineCollection({
	type: 'content',
	schema: bookSchema,
});

export type Book = Omit<z.infer<typeof bookSchema>, 'articleWriteDate'>;

export const collections = { blog, book };
