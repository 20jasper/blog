import { describe, expect, it } from 'vitest';
import { assembleReportedShortForm } from './assemble';
import { render } from './render';
import type { ReportedShortFormInput } from './assemble';

const CORLEY_NAME = {
	caseType: 'v',
	party1: 'Universal City Studios, Inc.',
	party2: 'Corley',
} as const;

// r[verify citation.reported-short-form]
// r[verify case-name.short-form]
// r[verify short-form.party-choice]
describe('assembleReportedShortForm', () => {
	it.each([
		['full', 'Universal City Studios, Inc. v. Corley, 273 F.3d at 435.'],
		['party1', 'Universal City Studios, Inc., 273 F.3d at 435.'],
		['party2', 'Corley, 273 F.3d at 435.'],
	] as const)('%s name variant', (nameVariant, expected) => {
		const input: ReportedShortFormInput = {
			nameVariant,
			name: CORLEY_NAME,
			volume: '273',
			reporter: 'F.3d',
			pincite: '435',
		};

		const { plain } = render(assembleReportedShortForm(input), {
			emphasis: 'italic',
		});

		expect(plain).toBe(expected);
	});

	it.each(['party1', 'party2'] as const)(
		'%s collapses to the assembled name for In re (single-party types)',
		(nameVariant) => {
			const input: ReportedShortFormInput = {
				nameVariant,
				name: { caseType: 'in-re', party1: 'Smith' },
				volume: '273',
				reporter: 'F.3d',
				pincite: '435',
			};

			const { plain } = render(assembleReportedShortForm(input), {
				emphasis: 'italic',
			});

			expect(plain).toBe('In re Smith, 273 F.3d at 435.');
		},
	);

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

// r[verify normalize.span-input]
// r[verify normalize.span-separator]
describe('assembleReportedShortForm: pincite is parsed, not passed through raw', () => {
	it.each([
		['435', undefined, '273 F.3d at 435.'],
		['208-214', undefined, '273 F.3d at 208-14.'],
		['208-214', '–' as const, '273 F.3d at 208–14.'],
	])(
		'pincite %s with separator %s -> %s',
		(pincite, spanSeparator, expected) => {
			const input: ReportedShortFormInput = {
				nameVariant: 'none',
				volume: '273',
				reporter: 'F.3d',
				pincite,
			};

			const { plain } = render(
				assembleReportedShortForm(input, { spanSeparator }),
				{
					emphasis: 'italic',
				},
			);

			expect(plain).toBe(expected);
		},
	);
});
