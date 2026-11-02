import { getCollection } from 'astro:content';
import { Order } from 'effect';

export const getPostsDescending = async () =>
	(await getCollection('blog')).toSorted(
		Order.mapInput(
			Order.mapInput(Order.Number, (date: Date) => -date.getTime()),
			({ data }) => data.pubDate,
		),
	);
