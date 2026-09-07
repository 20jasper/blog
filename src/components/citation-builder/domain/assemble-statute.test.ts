import { describe, expect, it } from 'vitest';
import { assembleStatuteCase, assembleStatuteShortForm } from './assemble';
import { annotatedStatute, officialStatute } from './assemble-fixtures';
import { render } from './render';

// r[verify citation.statute-long-form]
describe('assembleStatuteCase', () => {
	it('matches the §8.3 golden case exactly (annotated, main volume only)', () => {
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
					materialLocation: { kind: 'main-volume', year: 1994 },
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
					materialLocation: { kind: 'main-volume', year: 1996 },
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
					materialLocation: { kind: 'main-volume', year: 1996 },
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Consumer Credit Code, Okla. Stat. tit. 14A, § 6-203 (1996).',
		);
	});
});

// r[verify statute.material-location]
// r[verify citation.statute-supplement]
describe('assembleStatuteCase: material location and supplement forms', () => {
	it('official, both main volume and supplement', () => {
		const { plain } = render(
			assembleStatuteCase(
				officialStatute({
					title: { text: '42', position: 'before-code' },
					codeAbbreviation: 'U.S.C.',
					section: '3001',
					materialLocation: {
						kind: 'both',
						year: 1994,
						supplement: { designation: 'Supp. V', year: 1999 },
					},
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('42 U.S.C. § 3001 (1994 & Supp. V 1999).');
	});

	it('official, supplement only -- no base year at all', () => {
		const { plain } = render(
			assembleStatuteCase(
				officialStatute({
					title: { text: '42', position: 'before-code' },
					codeAbbreviation: 'U.S.C.',
					section: '1985',
					materialLocation: {
						kind: 'supplement-only',
						supplement: { designation: 'Supp. V', year: 1999 },
					},
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('42 U.S.C. § 1985 (Supp. V 1999).');
	});

	// r[verify statute.supplement-scope]
	// r[verify statute.supplement-pairing]
	// r[verify statute.supplement-designation-freeform]
	it('official, both, no publisher -- confirms r[statute.supplement-scope]', () => {
		const { plain } = render(
			assembleStatuteCase(
				officialStatute({
					codeAbbreviation: 'Haw. Rev. Stat.',
					section: '703-309',
					materialLocation: {
						kind: 'both',
						year: 2014,
						supplement: { designation: 'Supp.', year: 2017 },
					},
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('Haw. Rev. Stat. § 703-309 (2014 & Supp. 2017).');
	});

	it('annotated, both main volume and supplement', () => {
		const { plain } = render(
			assembleStatuteCase(
				annotatedStatute({
					title: { text: '42', position: 'before-code' },
					codeAbbreviation: 'U.S.C.A.',
					section: '1983',
					publisher: 'West',
					materialLocation: {
						kind: 'both',
						year: 2000,
						supplement: { designation: 'Supp.', year: 2002 },
					},
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('42 U.S.C.A. § 1983 (West 2000 & Supp. 2002).');
	});

	it('annotated, supplement only -- no base year at all', () => {
		const { plain } = render(
			assembleStatuteCase(
				annotatedStatute({
					title: { text: '42', position: 'before-code' },
					codeAbbreviation: 'U.S.C.A.',
					section: '2001',
					publisher: 'West',
					materialLocation: {
						kind: 'supplement-only',
						supplement: { designation: 'Supp.', year: 2002 },
					},
				}),
			),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('42 U.S.C.A. § 2001 (West Supp. 2002).');
	});
});

// r[verify citation.statute-short-form]
describe('assembleStatuteShortForm', () => {
	it('drops the entire parenthetical -- publisher, year, and any supplement', () => {
		const { plain } = render(
			assembleStatuteShortForm({
				codeAbbreviation: 'Ohio Rev. Code Ann.',
				section: '3767.32(A)',
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('Ohio Rev. Code Ann. § 3767.32(A).');
	});

	it('renders the title before the code, no comma (federal shape)', () => {
		const { plain } = render(
			assembleStatuteShortForm({
				codeAbbreviation: 'U.S.C.',
				section: '1983',
				title: { text: '42', position: 'before-code' },
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('42 U.S.C. § 1983.');
	});

	it('renders the title after the code, comma-separated (state shape)', () => {
		const { plain } = render(
			assembleStatuteShortForm({
				codeAbbreviation: 'Okla. Stat.',
				section: '6-203',
				title: { text: 'tit. 14A', position: 'after-code' },
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('Okla. Stat. tit. 14A, § 6-203.');
	});

	it('prefixes the popular name, comma-separated', () => {
		const { plain } = render(
			assembleStatuteShortForm({
				codeAbbreviation: 'Okla. Stat.',
				section: '6-203',
				title: { text: 'tit. 14A', position: 'after-code' },
				popularName: 'Consumer Credit Code',
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('Consumer Credit Code, Okla. Stat. tit. 14A, § 6-203.');
	});

	it('does not double the § symbol when section is already prefixed, per §4.2', () => {
		const { plain } = render(
			assembleStatuteShortForm({
				codeAbbreviation: 'Ohio Rev. Code Ann.',
				section: '§ 3767.32(A)',
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toContain('§ 3767.32(A)');
		expect(plain).not.toContain('§ § 3767.32(A)');
	});
});
