import type { APIRoute } from 'astro';
import { getFeed } from '@services/get-feed';

export const GET: APIRoute = async (context) => {
	const feed = await getFeed(context.site!.href);

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/rss+xml',
		},
	});
};
