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
	readDate: z.object({ start: z.coerce.date(), end: z.coerce.date() }),
	author: z.string(),
});

const book = defineCollection({
	type: 'content',
	schema: bookSchema,
});

export type Book = z.infer<typeof bookSchema>;

export const collections = { blog, book };
