import type { Book } from '@content/config';

import { Option, Order } from 'effect';

const byDateDesc = (key: keyof Book['readDate']) =>
	Order.mapInput(
		Option.getOrder(Order.reverse(Order.Date)),
		({ readDate }: Book) => Option.fromNullable(readDate[key]),
	);

export const booksStarted: Book[] = [
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
		title: 'Learn Bash the Hard Way',
		readDate: {
			start: new Date('2025-2-28'),
			end: new Date('2025-3-22'),
		},
		author: 'Andy Hunt and Dave Thomas',
		rating: 5,
	},
	{
		title: 'DNS and BIND',
		readDate: {
			start: new Date('2025-3-25'),
			end: new Date('2025-4-04'),
		},
		author: 'Cricket Liu and Paul Albitz',
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
			end: new Date('2025-2-20'),
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
			end: new Date('2025-4-15'),
		},
		author: 'Keith Ferrazzi',
		rating: 4,
	},
	{
		title: 'Asynchronous Programming in Rust',
		readDate: {
			start: new Date('2025-1-2'),
			end: new Date('2025-2-3'),
		},
		author: 'Carl Fredrik Samson',
		rating: 5,
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
	{
		title: 'UNIX and Linux System Administration Handbook (First Half)',
		author: 'Evi Nemeth, Garth Snyder, Trent Hein, Ben Whaley, and Dan Mackin',
		readDate: {
			start: new Date('2025-2-4'),
			end: new Date('2025-2-27'),
		},
		rating: 5,
	},
	{
		title: 'Linchpin',
		author: 'Seth Godin',
		readDate: {
			start: new Date('2025-4-15'),
			end: new Date('2025-5-11'),
		},
		rating: 4,
	},
	{
		title: 'REST in Practice',
		author: 'Ian Robinson, Jim Webber, and Savas Parastatidis',
		readDate: {
			start: new Date('2025-4-15'),
			end: new Date('2025-5-20'),
		},
		rating: 4,
	},
	{
		title: 'Seven Habits of Highly Effective People',
		author: 'Stephen Covey',
		readDate: {
			start: new Date('2025-5-12'),
			end: null,
		},
		rating: null,
	},
	{
		title: 'Joy of React',
		author: 'Josh Comeau',
		readDate: {
			start: new Date('2025-5-11'),
			end: new Date('2025-6-9'),
		},
		rating: 5,
	},
	{
		title: 'Effective Rust',
		author: 'David Drysdale',
		readDate: {
			start: new Date('2025-5-20'),
			end: new Date('2025-6-9'),
		},
		rating: 5,
	},
	{
		title: 'Learn System Design in a Hurry',
		author: 'hellointerview.com',
		readDate: {
			start: new Date('2025-5-20'),
			end: null,
		},
		rating: 5,
	},
	{
		title: 'Testing JavaScript',
		author: 'Kent C. Dodds',
		readDate: {
			start: new Date('2025-6-20'),
			end: null,
		},
		rating: null,
	},
	{
		title: 'Designing Data–Intensive Applications (1st Edition)',
		author: 'Martin Kleppmann',
		readDate: {
			start: new Date('2025-6-16'),
			end: null,
		},
		rating: null,
	},
].sort(Order.combine(byDateDesc('end'), byDateDesc('start')));

type UnreadBook = Omit<Book, 'readDate' | 'rating'>;
const toRead: UnreadBook[] = [
	{
		title: 'Zero to Production In Rust',
		author: 'Luca Palmieri',
	},
	{
		title: 'Pragmatic Type-Level Design',
		author: 'Alexander Granin',
	},
	{
		title: 'The Way of the Shepherd',
		author: 'Kevin Leman and William Pentak',
	},
	{
		title: 'The Effective Engineer',
		author: 'Edmond Lau',
		// https://writings.edmondlau.co/p/what-i-got-wrong-from-the-effective
	},
	{
		title: 'Refactoring UI',
		author: 'Adam Wathan and Steve Schoger',
	},
];

export const booksToRead: Book[] = toRead.map((x) => ({
	...x,
	readDate: { start: null, end: null },
	rating: null,
}));
