import { describe, expect, it } from 'vitest';
import { assemble } from './citation-input';
import { render } from '../domain/render';
import type { CitationInput } from './citation-input';

// Exact golden-case wording already lives in assemble.test.ts; these only
// confirm assemble() routes each mode to the right function and that
// options actually thread through.
describe('assemble', () => {
	it('dispatches full to assembleReportedCase', () => {
		const citation: CitationInput = {
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

		expect(plain).toContain('1 R 2,');
	});

	it('dispatches short to assembleReportedShortForm', () => {
		const citation: CitationInput = {
			mode: 'short',
			input: { nameVariant: 'id', pincite: '3' },
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		expect(plain).toBe('Id. at 3.');
	});

	it('threads spanSeparator through to the underlying assembler', () => {
		const citation: CitationInput = {
			mode: 'short',
			input: { nameVariant: 'id', pincite: '1-2' },
		};

		const { plain } = render(assemble(citation, { spanSeparator: '–' }), {
			emphasis: 'italic',
		});

		expect(plain).toBe('Id. at 1–2.');
	});
});
