import type { Book } from '../config';

import { Option, Order } from 'effect';

const byDateDesc = (key: keyof Book['readDate']) =>
	Order.mapInput(
		Option.getOrder(Order.reverse(Order.Date)),
		({ readDate }: Book) => Option.fromNullable(readDate[key]),
	);

export const books: Book[] = [
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
			start: new Date('2024-10-31'),
			end: null,
		},
		author: 'Miran Lipovaca',
		rating: 4,
	},
	{
		title: 'The Subtle Art of Not Giving a F*ck',
		readDate: {
			start: new Date('2024-12-21'),
			end: new Date('2025-01-09'),
		},
		author: 'Mark Manson',
		rating: 3,
	},
	{
		title: 'Never Eat Alone',
		readDate: {
			start: new Date('2025-01-09'),
			end: null,
		},
		author: 'Keith Ferrazzi',
		rating: null,
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
	{
		title: "Professor Frisby's Mostly Adequate Guide to Functional Programming",
		readDate: {
			start: new Date('2023-06-19'),
			end: new Date('2023-08-19'),
		},
		author: 'Brian Lonsdorf',
		rating: 5,
	},
].sort(Order.combine(byDateDesc('end'), byDateDesc('start')));
