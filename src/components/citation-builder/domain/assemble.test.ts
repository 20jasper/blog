import { describe, expect, it } from 'vitest';
import { assembleReportedCase } from './assemble';
import { reportedCase } from './assemble-fixtures';
import { render } from './render';

// r[verify citation.reported-long-form]
// r[verify assemble.composable]
describe('assembleReportedCase: golden case', () => {
	it('matches the §8.3 golden case exactly', () => {
		const { plain } = render(assembleReportedCase(reportedCase()), {
			emphasis: 'italic',
		});

		expect(plain).toBe(
			'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});

	it('italicizes only the case name', () => {
		const { html } = render(assembleReportedCase(reportedCase()), {
			emphasis: 'italic',
		});

		expect(html).toBe(
			'<i>Dayton v. Stewart</i>, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});
});

describe('assembleReportedCase: field variations', () => {
	it('omits the pincite segment when absent, per §3.1 (optional for full citation)', () => {
		const { plain } = render(
			assembleReportedCase(reportedCase({ pincite: undefined })),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Dayton v. Stewart, 179 N.E.3d 208 (Ohio Ct. App. 2021).',
		);
	});

	it('assembles In re and Ex parte names the same way, via the shared case-type table', () => {
		const { plain } = render(
			assembleReportedCase(
				reportedCase({ name: { caseType: 'in-re', party1: 'Smith' } }),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'In re Smith, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});

	// r[verify court.optional]
	it('omits the court entirely when blank, matching the §8.3 Roe v. Wade golden case', () => {
		const { plain } = render(
			assembleReportedCase(
				reportedCase({
					name: { caseType: 'v', party1: 'Roe', party2: 'Wade' },
					volume: '410',
					reporter: 'U.S.',
					firstPage: '113',
					pincite: '164',
					court: undefined,
					year: 1973,
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('Roe v. Wade, 410 U.S. 113, 164 (1973).');
	});
});

// r[verify normalize.span-input]
// r[verify normalize.span-separator]
describe('assembleReportedCase: pincite is parsed, not passed through raw', () => {
	it.each([
		['214', undefined, '208, 214'],
		['208-214', undefined, '208, 208-14'],
		['208-214', '–' as const, '208, 208–14'],
		['490, 495', undefined, '208, 490, 495'],
		['1137 n.4', undefined, '208, 1137 n.4'],
	])(
		'pincite %s with separator %s -> %s',
		(pincite, spanSeparator, expectedFirstPageAndPincite) => {
			const { plain } = render(
				assembleReportedCase(reportedCase({ pincite }), { spanSeparator }),
				{ emphasis: 'italic' },
			);

			expect(plain).toBe(
				`Dayton v. Stewart, 179 N.E.3d ${expectedFirstPageAndPincite} (Ohio Ct. App. 2021).`,
			);
		},
	);
});
