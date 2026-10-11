import { describe, expect, it } from 'vitest';
import { initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import { renderCitation } from './render-citation';

const FIELDS = {
	...initialCitationFields(),
	party1: 'Dayton',
	party2: 'Stewart',
	volume: '179',
	reporter: 'N.E.3d',
	firstPage: '208',
	pincite: '214',
	court: 'Ohio Ct. App.',
	year: '2021',
};

describe('renderCitation', () => {
	it('renders the full citation as html and plain text', () => {
		const { plain, html } = renderCitation(FIELDS, initialDisplayState());

		expect(plain).toBe(
			'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
		expect(html).toContain('<i>Dayton v. Stewart</i>');
	});

	it('renders a different form from the same fields', () => {
		const { plain } = renderCitation(FIELDS, {
			...initialDisplayState(),
			mode: 'short',
			nameVariant: 'party1',
		});

		expect(plain).toBe('Dayton, 179 N.E.3d at 214.');
	});
});
