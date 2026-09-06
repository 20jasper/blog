import { describe, expect, it } from 'vitest';
import { assembleReportedShortForm } from './assemble';
import { render } from './render';
import type { ReportedShortFormInput } from './assemble';

// r[verify citation.reported-short-form]
describe('assembleReportedShortForm', () => {
	// Georgetown's real-world short form for this case is "Corley, 273 F.3d
	// at 435" -- real Bluebook practice (Rule 10.9(a)(i)) keeps whichever
	// party is more distinctive, dropping the corporate plaintiff. Our
	// spec deliberately doesn't automate that judgment call (§3.1/§4.4:
	// short form is always Party 1, a documented V1 simplification), so
	// "short" below differs from Georgetown's real citation on purpose.
	it.each([
		['full', 'Universal City Studios, Inc. v. Corley, 273 F.3d at 435.'],
		['short', 'Universal City Studios, Inc., 273 F.3d at 435.'],
	] as const)('%s name variant', (nameVariant, expected) => {
		const input: ReportedShortFormInput = {
			nameVariant,
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
			emphasis: 'italic',
		});

		expect(plain).toBe(expected);
	});

	it('no-name variant omits the name segment entirely, per §5.2', () => {
		const input: ReportedShortFormInput = {
			nameVariant: 'none',
			volume: '273',
			reporter: 'F.3d',
			pincite: '435',
		};

		const { plain } = render(assembleReportedShortForm(input), {
			emphasis: 'italic',
		});

		expect(plain).toBe('273 F.3d at 435.');
	});

	it('id variant matches the §5.7 Georgetown-verified example', () => {
		const input: ReportedShortFormInput = {
			nameVariant: 'id',
			pincite: '435',
		};

		const { html, plain } = render(assembleReportedShortForm(input), {
			emphasis: 'italic',
		});

		expect(plain).toBe('Id. at 435.');
		expect(html).toBe('<i>Id.</i> at 435.');
	});
});
