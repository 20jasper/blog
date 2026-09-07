import {
	assert,
	boolean,
	constantFrom,
	integer,
	property,
	record,
	string,
} from 'fast-check';
import { describe, expect, it } from 'vitest';
import { render } from '../domain/render';
import { MONTHS } from '../domain/types';
import { assemble } from './citation-input';
import { buildCitationInput } from './citation-input-builders';
import type { CitationFields } from './citation-fields';
import type { DisplayState } from './display-state';

// Whole-pipeline fuzz: CitationFields -> buildCitationInput -> assemble
// -> render, with fully random field values across all three source
// types/modes -- not scoped to any single field or branch, unlike the
// targeted property tests elsewhere. This is what actually caught the
// NaN-year bug (state/citation-input-builders.test.ts): a narrower,
// single-field test wouldn't have exercised the full composition.
const digitString = integer({ min: 0, max: 9999 }).map(String);
const freeform = string({ maxLength: 12 });

const fieldsArb: ReturnType<typeof record<CitationFields>> = record({
	sourceType: constantFrom('reported', 'unreported', 'statute'),
	caseType: constantFrom('v', 'in-re', 'ex-parte'),
	party1: freeform,
	party2: freeform,
	court: freeform,
	pincite: freeform,
	volume: freeform,
	reporter: freeform,
	firstPage: freeform,
	year: digitString,
	availability: constantFrom('database', 'slip-opinion'),
	docketNumber: freeform,
	databaseIdentifier: freeform,
	month: constantFrom(...MONTHS),
	day: digitString,
	dateYear: digitString,
	codeType: constantFrom('official', 'annotated'),
	codeAbbreviation: freeform,
	section: freeform,
	publisher: freeform,
	materialLocation: constantFrom('main-volume', 'both', 'supplement-only'),
	codeYear: digitString,
	supplementDesignation: freeform,
	supplementYear: digitString,
});

const displayArb: ReturnType<typeof record<DisplayState>> = record({
	mode: constantFrom('full', 'short'),
	nameVariant: constantFrom('full', 'party1', 'party2', 'none'),
	useId: boolean(),
	emphasis: constantFrom('italic', 'underline'),
	spanSeparator: constantFrom('-', '–'),
});

// Only the numeric-field/month guards (state/citation-input-builders.ts)
// are expected to ever throw here -- anything else is a real bug.
const EXPECTED_THROW =
	/^invalid (year|day|dateYear|codeYear|supplementYear|month):/u;

describe('citation pipeline: fully random fields never produce garbage output', () => {
	it('either throws an expected numeric/month error, or renders with no NaN/undefined/[object Object]', () => {
		assert(
			property(fieldsArb, displayArb, (fields, display) => {
				let citation;
				try {
					citation = buildCitationInput(fields, display);
				} catch (error) {
					if (!(error instanceof Error)) {
						throw error;
					}
					expect(error.message).toMatch(EXPECTED_THROW);
					return;
				}

				const segments = assemble(citation, {
					spanSeparator: display.spanSeparator,
				});
				const { html, plain } = render(segments, {
					emphasis: display.emphasis,
				});

				expect(html).not.toMatch(/NaN|undefined|\[object Object\]/u);
				expect(plain).not.toMatch(/NaN|undefined|\[object Object\]/u);
			}),
			{ numRuns: 2000 },
		);
	});
});
