import { describe, expect, it } from 'vitest';
import { assembleReportedShortForm } from './assemble';
import { render } from './render';
import type { ReportedShortFormInput } from './assemble';

// r[verify citation.reported-short-form]
describe('assembleReportedShortForm', () => {
	it('full name variant matches the §5.7 Georgetown-verified example', () => {
		const input: ReportedShortFormInput = {
			nameVariant: 'full',
			name: {
				caseType: 'v',
				party1: 'Universal City Studios, Inc.',
				party2: 'Corley',
			},
			volume: '273',
			reporter: 'F.3d',
			pincite: '435',
		};

		const { plain } = render(assembleReportedShortForm(input), {
			typeface: 'italic',
		});

		expect(plain).toBe(
			'Universal City Studios, Inc. v. Corley, 273 F.3d at 435.',
		);
	});

	// Georgetown's real-world short form for this case is "Corley, 273 F.3d
	// at 435" -- real Bluebook practice (Rule 10.9(a)(i)) keeps whichever
	// party is more distinctive, dropping the corporate plaintiff. Our
	// spec deliberately doesn't automate that judgment call (§3.1/§4.4:
	// short form is always Party 1, a documented V1 simplification), so
	// our correct output here differs from Georgetown's on purpose.
	it('short name variant uses Party 1, per the documented always-Party-1 simplification (§3.1/§4.4)', () => {
		const input: ReportedShortFormInput = {
			nameVariant: 'short',
			name: {
				caseType: 'v',
				party1: 'Universal City Studios, Inc.',
				party2: 'Corley',
			},
			volume: '273',
			reporter: 'F.3d',
			pincite: '435',
		};

		const { plain } = render(assembleReportedShortForm(input), {
			typeface: 'italic',
		});

		expect(plain).toBe('Universal City Studios, Inc., 273 F.3d at 435.');
	});

	it('no-name variant omits the name segment entirely, per §5.2', () => {
		const input: ReportedShortFormInput = {
			nameVariant: 'none',
			volume: '273',
			reporter: 'F.3d',
			pincite: '435',
		};

		const { plain } = render(assembleReportedShortForm(input), {
			typeface: 'italic',
		});

		expect(plain).toBe('273 F.3d at 435.');
	});

	it('id variant matches the §5.7 Georgetown-verified example', () => {
		const input: ReportedShortFormInput = {
			nameVariant: 'id',
			pincite: '435',
		};

		const { html, plain } = render(assembleReportedShortForm(input), {
			typeface: 'italic',
		});

		expect(plain).toBe('Id. at 435.');
		expect(html).toBe('<i>Id.</i> at 435.');
	});
});
