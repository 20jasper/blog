import { describe, expect, it } from 'vitest';
import { assembleReportedCase } from './assemble';
import { reportedCase } from './assemble-fixtures';
import { render } from './render';

// r[verify citation.reported-long-form]
// r[verify assemble.composable]
describe('assembleReportedCase: golden case', () => {
	it('matches the §8.3 golden case exactly', () => {
		const { plain } = render(assembleReportedCase(reportedCase()), {
			typeface: 'italic',
		});

		expect(plain).toBe(
			'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});

	it('italicizes only the case name', () => {
		const { html } = render(assembleReportedCase(reportedCase()), {
			typeface: 'italic',
		});

		expect(html).toBe(
			'<i>Dayton v. Stewart</i>, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});
});

describe('assembleReportedCase: field variations', () => {
	it('omits the pincite segment when absent, per §3.1 (optional for full citation)', () => {
		const { plain } = render(
			assembleReportedCase(reportedCase({ pincite: '' })),
			{ typeface: 'italic' },
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
			{ typeface: 'italic' },
		);

		expect(plain).toBe(
			'In re Smith, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});
});
