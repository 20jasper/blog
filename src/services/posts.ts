import { getCollection } from 'astro:content';

export const getPostsDescending = async () =>
	(await getCollection('blog')).toSorted((a, b) =>
		new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime(),
	);
