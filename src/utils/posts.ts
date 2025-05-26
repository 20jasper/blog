import { getCollection } from 'astro:content';
import { Order } from 'effect';

export const getPostsDescending = async () =>
	(await getCollection('blog')).sort(
		Order.mapInput(Order.reverse(Order.Date), ({ data }) => data.pubDate),
	);
