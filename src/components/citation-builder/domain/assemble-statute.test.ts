import { describe, expect, it } from 'vitest';
import { assembleStatuteCase } from './assemble';
import { annotatedStatute, officialStatute } from './assemble-fixtures';
import { render } from './render';

// r[verify citation.statute-long-form]
describe('assembleStatuteCase', () => {
	it('matches the §8.3 golden case exactly (annotated, no supplement)', () => {
		const { plain } = render(assembleStatuteCase(annotatedStatute()), {
			typeface: 'italic',
		});

		expect(plain).toBe('Ohio Rev. Code Ann. § 3767.32(A) (West 2025).');
	});

	it('omits the publisher segment for official code, per §5.6', () => {
		const { plain } = render(assembleStatuteCase(officialStatute()), {
			typeface: 'italic',
		});

		expect(plain).toBe('Ohio Rev. Code § 3767.32(A) (2025).');
	});

	it('joins base year and supplement per the inferred §5.6 format, pending confirmation', () => {
		const input = annotatedStatute({
			year: 2018,
			supplement: { designation: 'Supp.', year: 2020 },
		});

		const { plain } = render(assembleStatuteCase(input), {
			typeface: 'italic',
		});

		expect(plain).toBe(
			'Ohio Rev. Code Ann. § 3767.32(A) (West 2018 & Supp. 2020).',
		);
	});

	it('does not double the § symbol when section is already prefixed, per §4.2', () => {
		const { plain } = render(
			assembleStatuteCase(officialStatute({ section: '§ 3767.32(A)' })),
			{ typeface: 'italic' },
		);

		expect(plain).toContain('§ 3767.32(A)');
		expect(plain).not.toContain('§ § 3767.32(A)');
	});
});
