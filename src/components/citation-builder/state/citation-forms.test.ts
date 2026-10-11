import { describe, expect, it } from 'vitest';
import { initialCitationFields } from './citation-fields';
import { citationForms, currentFormId } from './citation-forms';
import { initialDisplayState } from './display-state';

const FIELDS = {
	...initialCitationFields(),
	party1: 'Dayton',
	party2: 'Stewart',
	volume: '179',
	reporter: 'N.E.3d',
	firstPage: '208',
	year: '2021',
};

function validById(forms: ReturnType<typeof citationForms>) {
	return Object.fromEntries(forms.map((form) => [form.id, form.valid]));
}

describe('citationForms', () => {
	it('offers every case form and marks which ones the fields can fill', () => {
		expect(validById(citationForms(FIELDS, initialDisplayState()))).toEqual({
			full: true,
			'short-name': false,
			'short-none': false,
			id: false,
		});
	});

	it('enables the short forms once a pincite is filled in', () => {
		const forms = citationForms(
			{ ...FIELDS, pincite: '214' },
			initialDisplayState(),
		);

		expect(validById(forms)).toEqual({
			full: true,
			'short-name': true,
			'short-none': true,
			id: true,
		});
	});

	it('disables the full form when a full-only field is missing', () => {
		const forms = citationForms(
			{ ...FIELDS, year: '', pincite: '214' },
			initialDisplayState(),
		);

		expect(validById(forms).full).toBe(false);
	});

	it('offers a full and a short form for statutes', () => {
		const forms = citationForms(FIELDS, {
			...initialDisplayState(),
			sourceType: 'statute',
		});

		expect(forms.map((form) => form.id)).toEqual(['full', 'short']);
	});

	it('keeps the saved display settings other than the form itself', () => {
		const display = {
			...initialDisplayState(),
			emphasis: 'underline',
		} as const;

		const forms = citationForms(FIELDS, display);

		expect(forms.every((form) => form.display.emphasis === 'underline')).toBe(
			true,
		);
	});
});

describe('currentFormId', () => {
	it('is full for a full citation', () => {
		expect(currentFormId(initialDisplayState())).toBe('full');
	});

	it('is id when the short form uses Id.', () => {
		expect(
			currentFormId({ ...initialDisplayState(), mode: 'short', useId: true }),
		).toBe('id');
	});

	it('is short-none for a short form without a name', () => {
		expect(
			currentFormId({
				...initialDisplayState(),
				mode: 'short',
				nameVariant: 'none',
			}),
		).toBe('short-none');
	});

	it('is short-name for a short form with a name', () => {
		expect(
			currentFormId({
				...initialDisplayState(),
				mode: 'short',
				nameVariant: 'party1',
			}),
		).toBe('short-name');
	});

	it('is short for a short statute', () => {
		expect(
			currentFormId({
				...initialDisplayState(),
				sourceType: 'statute',
				mode: 'short',
			}),
		).toBe('short');
	});
});
