import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '@src/consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map(({ data, slug }) => ({
			title: data.title,
			description: data.description,
			pubDate: data.pubDate,
			link: `/blog/${slug}/`,
		})),
	});
}
