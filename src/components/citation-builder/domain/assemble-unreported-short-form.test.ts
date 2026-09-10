import { describe, expect, it } from 'vitest';
import {
	assembleUnreportedShortForm,
	type UnreportedShortFormInput,
} from './assemble';
import { render } from './render';

const NAME = { caseType: 'v', party1: 'Beaven', party2: 'Justice' } as const;

function plainOf(input: UnreportedShortFormInput): string {
	return render(assembleUnreportedShortForm(input), { emphasis: 'italic' })
		.plain;
}

// r[verify citation.unreported-short-form]
describe('assembleUnreportedShortForm: golden database case', () => {
	it('matches the domain-spec.md Unreported Short Form worked example', () => {
		expect(
			plainOf({
				nameVariant: 'none',
				availability: 'database',
				databaseId: '2007 WL 1032301',
				pincite: '3',
			}),
		).toBe('2007 WL 1032301, at *3.');
	});

	it('includes the name when a party variant is chosen', () => {
		expect(
			plainOf({
				nameVariant: 'party1',
				name: NAME,
				availability: 'database',
				databaseId: '2007 WL 1032301',
				pincite: '3',
			}),
		).toBe('Beaven, 2007 WL 1032301, at *3.');
	});
});

describe('assembleUnreportedShortForm: slip availability', () => {
	it('uses the docket number and "slip op. at", no star pages', () => {
		expect(
			plainOf({
				nameVariant: 'none',
				availability: 'slip',
				docket: '1-07-2937',
				pincite: '2',
			}),
		).toBe('No. 1-07-2937, slip op. at 2.');
	});
});

describe('assembleUnreportedShortForm: Id. gating', () => {
	it('stars the pincite for a database-sourced Id.', () => {
		expect(
			plainOf({ nameVariant: 'id', availability: 'database', pincite: '3' }),
		).toBe('Id. at *3.');
	});

	it('does not star the pincite for a slip-sourced Id.', () => {
		expect(
			plainOf({ nameVariant: 'id', availability: 'slip', pincite: '2' }),
		).toBe('Id. at 2.');
	});
});
