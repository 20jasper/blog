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

const book = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		author: z.string().optional(),
		link: z.string().optional(),
		description: z.string().optional(),
		readDate: z.coerce.date(),
	}),
});

export const collections = { blog, book };
