import { describe, expect, it } from 'vitest';
import { assembleUnreportedShortForm } from './assemble';
import { render } from './render';
import type { UnreportedShortFormInput } from './assemble';

const CHATLAS_NAME = {
	caseType: 'v',
	party1: 'Chatlas',
	party2: 'Allstate Ins. Co.',
} as const;

// r[verify citation.unreported-short-form]
// r[verify citation.unreported-pincite-form]
describe('assembleUnreportedShortForm', () => {
	it.each([
		[
			'full',
			{ kind: 'database', databaseId: '2008 WL 2610471' },
			'Chatlas v. Allstate Ins. Co., 2008 WL 2610471, at *2.',
		],
		[
			'party1',
			{ kind: 'database', databaseId: '2008 WL 2610471' },
			'Chatlas, 2008 WL 2610471, at *2.',
		],
		[
			'party2',
			{ kind: 'database', databaseId: '2008 WL 2610471' },
			'Allstate Ins. Co., 2008 WL 2610471, at *2.',
		],
		[
			'none',
			{ kind: 'database', databaseId: '2008 WL 2610471' },
			'2008 WL 2610471, at *2.',
		],
		[
			'full',
			{ kind: 'slip-opinion', docket: '1-07-2937' },
			'Chatlas v. Allstate Ins. Co., No. 1-07-2937, slip op. at 2.',
		],
		[
			'none',
			{ kind: 'slip-opinion', docket: '1-07-2937' },
			'No. 1-07-2937, slip op. at 2.',
		],
	] as const)(
		'%s name variant, %j availability',
		(nameVariant, availability, expected) => {
			const input: UnreportedShortFormInput =
				nameVariant === 'none'
					? { nameVariant, availability, pincite: '2' }
					: { nameVariant, name: CHATLAS_NAME, availability, pincite: '2' };

			const { plain } = render(assembleUnreportedShortForm(input), {
				emphasis: 'italic',
			});

			expect(plain).toBe(expected);
		},
	);

	it.each([
		[
			{ kind: 'database', databaseId: '2008 WL 2610471' } as const,
			'Id. at *2.',
		],
		[{ kind: 'slip-opinion', docket: '1-07-2937' } as const, 'Id. at 2.'],
	])('id variant, %j availability -> %s', (availability, expected) => {
		const input: UnreportedShortFormInput = {
			nameVariant: 'id',
			availability,
			pincite: '2',
		};

		const { plain } = render(assembleUnreportedShortForm(input), {
			emphasis: 'italic',
		});

		expect(plain).toBe(expected);
	});
});

// r[verify normalize.span-input]
describe('assembleUnreportedShortForm: pincite is parsed, not passed through raw', () => {
	it.each([
		['2', { kind: 'database', databaseId: '2008 WL 2610471' }, '*2'],
		['1-2', { kind: 'database', databaseId: '2008 WL 2610471' }, '*1-2'],
		['1-2', { kind: 'slip-opinion', docket: '1-07-2937' }, '1-2'],
	] as const)('pincite %s with %j -> %s', (pincite, availability, expected) => {
		const input: UnreportedShortFormInput = {
			nameVariant: 'none',
			availability,
			pincite,
		};

		const { plain } = render(assembleUnreportedShortForm(input), {
			emphasis: 'italic',
		});

		expect(plain).toContain(`at ${expected}`);
	});
});
