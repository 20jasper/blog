import { describe, expect, it } from 'vitest';
import { assembleStatuteCase } from './assemble';
import { annotatedStatute, officialStatute } from './assemble-fixtures';
import { render } from './render';

// r[verify citation.statute-long-form]
describe('assembleStatuteCase', () => {
	it('matches the §8.3 golden case exactly (annotated, no supplement)', () => {
		const { plain } = render(assembleStatuteCase(annotatedStatute()), {
			emphasis: 'italic',
		});

		expect(plain).toBe('Ohio Rev. Code Ann. § 3767.32(A) (West 2025).');
	});

	it('omits the publisher segment for official code, per §5.6', () => {
		const { plain } = render(assembleStatuteCase(officialStatute()), {
			emphasis: 'italic',
		});

		expect(plain).toBe('Ohio Rev. Code § 3767.32(A) (2025).');
	});

	it('joins base year and supplement per the inferred §5.6 format, pending confirmation', () => {
		const input = annotatedStatute({
			year: 2018,
			supplement: { designation: 'Supp.', year: 2020 },
		});

		const { plain } = render(assembleStatuteCase(input), {
			emphasis: 'italic',
		});

		expect(plain).toBe(
			'Ohio Rev. Code Ann. § 3767.32(A) (West 2018 & Supp. 2020).',
		);
	});

	it('does not double the § symbol when section is already prefixed, per §4.2', () => {
		const { plain } = render(
			assembleStatuteCase(officialStatute({ section: '§ 3767.32(A)' })),
			{ emphasis: 'italic' },
		);

		expect(plain).toContain('§ 3767.32(A)');
		expect(plain).not.toContain('§ § 3767.32(A)');
	});

	// r[verify statute.title]
	it('renders the title before the code, no comma (federal shape)', () => {
		const { plain } = render(
			assembleStatuteCase(
				officialStatute({
					title: { text: '42', position: 'before-code' },
					codeAbbreviation: 'U.S.C.',
					section: '1983',
					year: 1994,
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('42 U.S.C. § 1983 (1994).');
	});

	// r[verify statute.title]
	it('renders the title after the code, comma-separated (state shape)', () => {
		const { plain } = render(
			assembleStatuteCase(
				officialStatute({
					title: { text: 'tit. 14A', position: 'after-code' },
					codeAbbreviation: 'Okla. Stat.',
					section: '6-203',
					year: 1996,
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('Okla. Stat. tit. 14A, § 6-203 (1996).');
	});

	// r[verify statute.popular-name]
	it('prefixes the popular name, comma-separated, per Rule 12.2.1', () => {
		const { plain } = render(
			assembleStatuteCase(
				officialStatute({
					popularName: 'Consumer Credit Code',
					title: { text: 'tit. 14A', position: 'after-code' },
					codeAbbreviation: 'Okla. Stat.',
					section: '6-203',
					year: 1996,
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Consumer Credit Code, Okla. Stat. tit. 14A, § 6-203 (1996).',
		);
	});
});
