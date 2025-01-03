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
		title: 'Forget a Mentor, Find a Sponsor',
		readDate: {
			start: new Date('2024-10-03'),
			end: new Date('2024-10-29'),
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
	{
		title: 'The Subtle Art of Not Giving a F*ck',
		readDate: {
			start: new Date('2024-12-21'),
			end: new Date('2025-01-02'),
		},
		author: 'Mark Manson',
		rating: 3,
	},
	{
		title: 'Asynchronous Programming in Rust',
		readDate: {
			start: new Date('2025-1-2'),
			end: null,
		},
		author: 'Carl Fredrik Samson',
		rating: null,
	},
];
