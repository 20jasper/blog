import { getCollection } from 'astro:content';
import {
	SITE_TITLE,
	SITE_DESCRIPTION,
	RSS_PATH,
	ATOM_PATH,
	NAME,
} from '@src/consts';
import { Feed } from 'feed';
import { cache } from '@src/utils/cache';

const id = '0a923b0a-3099-483b-bdd9-283b9f48b17d';

export const getFeed = cache(async (baseUrl: string): Promise<Feed> => {
	const posts = await getCollection('blog');

	const feed = new Feed({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		id,
		link: baseUrl,
		feedLinks: {
			atom: `${baseUrl}${ATOM_PATH}`,
			rss: `${baseUrl}${RSS_PATH}`,
		},
		copyright: `&copy; ${new Date().getFullYear()} ${NAME}. All Rights Reserved`,
		author: {
			name: NAME,
			email: 'jacobasper191@gmail.com',
		},
	});

	posts.forEach(({ data, slug }) => {
		feed.addItem({
			title: data.title,
			description: data.description,
			link: `${baseUrl}/blog/${slug}/`,
			date: new Date(data.pubDate),
		});
	});
	return feed;
});
