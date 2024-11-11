import type { Book } from '../config';

export const booksWithoutArticles: Book[] = [
	{
		title: 'hi',
		description: 'cool book',
		readDate: {
			start: new Date('2024-10-05'),
			end: new Date('2024-10-06'),
		},
		author: 'author',
	},
];
