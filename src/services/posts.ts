import { getCollection } from 'astro:content';
import { Order } from 'effect';

export const getPostsDescending = async () =>
	(await getCollection('blog')).toSorted(
		Order.mapInput(Order.flip(Order.Date), ({ data }) => data.pubDate),
	);
