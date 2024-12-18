import type { Book } from '../config';

export const booksWithoutArticles: Book[] = [
	{
		title: 'The Pragmatic Programmer',
		description: 'Fill in the gaps of your dev process',
		readDate: {
			start: new Date('2024-8-25'),
			end: new Date('2024-10-13'),
		},
		author: 'Andy Hunt and Dave Thomas',
	},
	{
		title:
			'Forget a Mentor, Find a Sponsor: The New Way to Fast-Track Your Career',
		description: 'Hard work pays off (if someone is invested in your career)',
		readDate: {
			start: new Date('2024-10-03'),
			end: null,
		},
		author: 'Sylvia Ann Hewlett',
	},
	{
		title: 'The Rust Programming Language',
		description: 'Rust is a must',
		readDate: {
			start: new Date('2023-03-23'),
			end: new Date('2024-09-07'),
		},
		author: 'Steve Klabnik and Carol Nichols',
	},
	{
		title: "Learn You a Haskell for Great Good! A Beginner's Guide",
		description: '',
		readDate: {
			start: new Date('2023-10-31'),
			end: null,
		},
		author: 'Miran Lipovaca',
	},
];
