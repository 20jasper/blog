import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const bookSchema = z.object({
	title: z.string(),
	description: z.string().max(160),
	readDate: z.object({
		start: z.coerce.date(),
		end: z.coerce.date().nullable(),
	}),
	author: z.string(),
	articleWriteDate: z.coerce.date(),
});

const book = defineCollection({
	type: 'content',
	schema: bookSchema,
});

export type Book = Omit<z.infer<typeof bookSchema>, 'articleWriteDate'>;

export const collections = { blog, book };
