import { describe, expect, it } from 'vitest';
import { assemble } from './citation-input';
import { render } from '../domain/render';
import type { CitationInput } from './citation-input';

// Exact golden-case wording for each assembler already lives in
// assemble.test.ts/assemble-statute.test.ts; these only confirm assemble()
// routes each (sourceType, mode) pair to the right function -- via a
// structural marker unique to that branch, not a duplicated verbatim
// sentence -- plus that options actually thread through.
describe('assemble', () => {
	it('dispatches reported/full to assembleReportedCase', () => {
		const citation: CitationInput = {
			sourceType: 'reported',
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'A', party2: 'B' },
				volume: '1',
				reporter: 'R',
				firstPage: '2',
				pincite: '3',
				year: 2000,
			},
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		// Only the full form carries volume/reporter/firstPage together.
		expect(plain).toContain('1 R 2,');
	});

	it('dispatches reported/short to assembleReportedShortForm', () => {
		const citation: CitationInput = {
			sourceType: 'reported',
			mode: 'short',
			input: { nameVariant: 'id', pincite: '3' },
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		// Only the short form's 'id' variant renders bare "Id. at ...".
		expect(plain).toBe('Id. at 3.');
	});

	it('dispatches unreported/full to assembleUnreportedCase', () => {
		const citation: CitationInput = {
			sourceType: 'unreported',
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'A', party2: 'B' },
				docket: '1',
				availability: { kind: 'database', databaseId: 'X' },
				court: 'Ct.',
				date: { month: 'Jan.', day: 1, year: 2000 },
			},
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		// Only the full form carries a date parenthetical.
		expect(plain).toContain('Jan. 1, 2000');
	});

	it('dispatches unreported/short to assembleUnreportedShortForm', () => {
		const citation: CitationInput = {
			sourceType: 'unreported',
			mode: 'short',
			input: {
				nameVariant: 'none',
				availability: { kind: 'slip-opinion', docket: '1' },
				pincite: '2',
			},
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		// "slip op." only appears in the short form's slip-opinion pincite.
		expect(plain).toContain('slip op.');
	});

	it('dispatches statute/full to assembleStatuteCase', () => {
		const citation: CitationInput = {
			sourceType: 'statute',
			mode: 'full',
			input: {
				codeType: 'official',
				codeAbbreviation: 'C.',
				section: '1',
				materialLocation: { kind: 'main-volume', year: 2000 },
			},
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		// Only the full form carries the parenthetical at all.
		expect(plain).toMatch(/\(.*\)/u);
	});

	it('dispatches statute/short to assembleStatuteShortForm', () => {
		const citation: CitationInput = {
			sourceType: 'statute',
			mode: 'short',
			input: { codeAbbreviation: 'C.', section: '1' },
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		// Short form drops the entire parenthetical.
		expect(plain).not.toMatch(/\(.*\)/u);
	});

	it('threads spanSeparator through to the underlying assembler', () => {
		const citation: CitationInput = {
			sourceType: 'reported',
			mode: 'short',
			input: { nameVariant: 'id', pincite: '1-2' },
		};

		const { plain } = render(assemble(citation, { spanSeparator: '–' }), {
			emphasis: 'italic',
		});

		expect(plain).toBe('Id. at 1–2.');
	});
});
