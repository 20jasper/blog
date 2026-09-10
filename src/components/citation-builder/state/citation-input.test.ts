import { describe, expect, it } from 'vitest';
import { assemble } from './citation-input';
import { render } from '../domain/render';
import type { CitationInput } from './citation-input';

describe('assemble: reported', () => {
	it('dispatches full to assembleReportedCase', () => {
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

		expect(plain).toContain('1 R 2,');
	});

	it('dispatches short to assembleReportedShortForm', () => {
		const citation: CitationInput = {
			sourceType: 'reported',
			mode: 'short',
			input: { nameVariant: 'id', pincite: '3' },
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		expect(plain).toBe('Id. at 3.');
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

describe('assemble: unreported', () => {
	it('dispatches full to assembleUnreportedCase', () => {
		const citation: CitationInput = {
			sourceType: 'unreported',
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'A', party2: 'B' },
				docket: '05-1234',
				availability: 'slip',
				month: 'Oct.',
				day: 21,
				year: 2005,
			},
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		expect(plain).toBe('A v. B, No. 05-1234 (Oct. 21, 2005).');
	});

	it('dispatches short to assembleUnreportedShortForm', () => {
		const citation: CitationInput = {
			sourceType: 'unreported',
			mode: 'short',
			input: { nameVariant: 'id', availability: 'database', pincite: '3' },
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		expect(plain).toBe('Id. at *3.');
	});
});

describe('assemble: statute', () => {
	it('dispatches full to assembleStatute', () => {
		const citation: CitationInput = {
			sourceType: 'statute',
			mode: 'full',
			input: {
				code: 'U.S.C.',
				section: '107',
				materialLocation: 'main',
				year: 2012,
			},
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		expect(plain).toBe('U.S.C. § 107 (2012).');
	});

	it('dispatches short to assembleStatuteShortForm', () => {
		const citation: CitationInput = {
			sourceType: 'statute',
			mode: 'short',
			input: { code: 'U.S.C.', section: '107' },
		};

		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		expect(plain).toBe('U.S.C. § 107.');
	});
});

// r[verify signal.prefix]
describe('assemble: signal', () => {
	const citation: CitationInput = {
		sourceType: 'statute',
		mode: 'short',
		input: { code: 'U.S.C.', section: '107' },
	};

	it('prepends the signal text with a trailing space, italicized', () => {
		const { plain, html } = render(assemble(citation, { signal: 'see' }), {
			emphasis: 'italic',
		});

		expect(plain).toBe('See U.S.C. § 107.');
		expect(html).toContain('<i>See </i>');
	});

	it('is a no-op for "none"', () => {
		const { plain } = render(assemble(citation, { signal: 'none' }), {
			emphasis: 'italic',
		});

		expect(plain).toBe('U.S.C. § 107.');
	});

	it('is a no-op when signal is omitted entirely', () => {
		const { plain } = render(assemble(citation), { emphasis: 'italic' });

		expect(plain).toBe('U.S.C. § 107.');
	});
});
