import type { Book } from '../config';

export const booksWithoutArticles: Book[] = [
	{
		title: 'The Pragmatic Programmer',
		readDate: {
			start: new Date('2024-8-25'),
			end: new Date('2024-10-13'),
		},
		author: 'Andy Hunt and Dave Thomas',
		rating: 5,
	},
	{
		title:
			'Forget a Mentor, Find a Sponsor: The New Way to Fast-Track Your Career',
		readDate: {
			start: new Date('2024-10-03'),
			end: null,
		},
		author: 'Sylvia Ann Hewlett',
		rating: 5,
	},
	{
		title: 'The Rust Programming Language',
		readDate: {
			start: new Date('2023-03-23'),
			end: new Date('2024-09-07'),
		},
		author: 'Steve Klabnik and Carol Nichols',
		rating: 5,
	},
	{
		title: "Learn You a Haskell for Great Good! A Beginner's Guide",
		readDate: {
			start: new Date('2023-10-31'),
			end: null,
		},
		author: 'Miran Lipovaca',
		rating: 4,
	},
];
