import type { APIRoute } from 'astro';
import { getFeed } from '@content/blog/getFeed';

export const GET: APIRoute = async (context) => {
	const feed = await getFeed(context.site!.href);

	return new Response(feed.atom1(), {
		headers: {
			'Content-Type': 'application/atom+xml',
		},
	});
};
