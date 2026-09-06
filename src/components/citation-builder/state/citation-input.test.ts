import { describe, expect, it } from 'vitest';
import { assemble } from './citation-input';
import { render } from '../domain/render';
import type { CitationInput } from './citation-input';

describe('assemble', () => {
	it('dispatches reported/full to assembleReportedCase', () => {
		const citation: CitationInput = {
			sourceType: 'reported',
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'Dayton', party2: 'Stewart' },
				volume: '179',
				reporter: 'N.E.3d',
				firstPage: '208',
				pincite: '214',
				court: 'Ohio Ct. App.',
				year: 2021,
			},
		};

		const { plain } = render(assemble(citation), { typeface: 'italic' });

		expect(plain).toBe(
			'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});

	it('dispatches reported/short to assembleReportedShortForm', () => {
		const citation: CitationInput = {
			sourceType: 'reported',
			mode: 'short',
			input: { nameVariant: 'id', pincite: '435' },
		};

		const { plain } = render(assemble(citation), { typeface: 'italic' });

		expect(plain).toBe('Id. at 435.');
	});

	it('dispatches unreported/full to assembleUnreportedCase', () => {
		const citation: CitationInput = {
			sourceType: 'unreported',
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'State', party2: 'Lucko' },
				docket: '2021CA0007',
				availability: { kind: 'database', databaseId: '2021 WL 4269952' },
				court: 'Ohio Ct. App.',
				date: { month: 'Sept.', day: 17, year: 2021 },
			},
		};

		const { plain } = render(assemble(citation), { typeface: 'italic' });

		expect(plain).toBe(
			'State v. Lucko, No. 2021CA0007, 2021 WL 4269952 (Ohio Ct. App. Sept. 17, 2021).',
		);
	});

	it('dispatches statute/full to assembleStatuteCase', () => {
		const citation: CitationInput = {
			sourceType: 'statute',
			mode: 'full',
			input: {
				codeType: 'official',
				codeAbbreviation: 'Ohio Rev. Code',
				section: '3767.32(A)',
				year: 2025,
			},
		};

		const { plain } = render(assemble(citation), { typeface: 'italic' });

		expect(plain).toBe('Ohio Rev. Code § 3767.32(A) (2025).');
	});
});
