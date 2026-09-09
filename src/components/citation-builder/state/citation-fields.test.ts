import { describe, expect, it } from 'vitest';
import { deriveSelections, initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import type { CitationFields } from './citation-fields';
import type { DisplayState } from './display-state';

describe('deriveSelections', () => {
	it.each([
		[
			{ caseType: 'v' },
			{ mode: 'full' },
			{
				sourceShape: { sourceType: 'reported', mode: 'full' },
				caseType: 'v',
			},
		],
		[
			{ caseType: 'in-re' },
			{ mode: 'short' },
			{
				sourceShape: {
					sourceType: 'reported',
					mode: 'short',
					kind: 'name',
					nameVariant: 'full',
				},
				caseType: 'in-re',
			},
		],
	] as const)('%o + %o -> %o', (fieldOverrides, displayOverrides, expected) => {
		const fields: CitationFields = {
			...initialCitationFields(),
			...fieldOverrides,
		};
		const display: DisplayState = {
			...initialDisplayState(),
			...displayOverrides,
		};

		expect(deriveSelections(fields, display)).toEqual(expected);
	});
});
