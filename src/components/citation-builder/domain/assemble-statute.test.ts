import { describe, expect, it } from 'vitest';
import {
	assembleStatute,
	assembleStatuteShortForm,
	type StatuteInput,
} from './assemble-statute';
import { render } from './render';

type MainStatute = Extract<StatuteInput, { materialLocation: 'main' }>;
type SupplementStatute = Extract<
	StatuteInput,
	{ materialLocation: 'supplement' }
>;

function statute(overrides: Partial<MainStatute> = {}): MainStatute {
	return {
		title: '17',
		code: 'U.S.C.',
		section: '107',
		materialLocation: 'main',
		year: 2012,
		...overrides,
	};
}

function plainOf(input: StatuteInput): string {
	return render(assembleStatute(input), { emphasis: 'italic' }).plain;
}

// r[verify citation.statute-long-form]
describe('assembleStatute: golden case', () => {
	it('matches the domain-spec.md 17 U.S.C. § 107 worked example', () => {
		expect(plainOf(statute())).toBe('17 U.S.C. § 107 (2012).');
	});

	it('normalizes a section value that was not pre-prefixed with §', () => {
		expect(plainOf(statute({ section: '107' }))).toContain('§ 107');
	});
});

describe('assembleStatute: title', () => {
	it('omits the title entirely when absent', () => {
		expect(plainOf(statute({ title: undefined, code: 'Va. Code Ann.' }))).toBe(
			'Va. Code Ann. § 107 (2012).',
		);
	});
});

// r[verify statute.popular-name]
describe('assembleStatute: popular name', () => {
	it('prefixes the popular name with a trailing comma when present', () => {
		expect(
			plainOf(
				statute({
					popularName: 'Copyright Act of 1976',
					title: undefined,
					code: 'U.S.C.',
					section: '§§ 101-1332',
				}),
			),
		).toBe('Copyright Act of 1976, U.S.C. §§ 101-1332 (2012).');
	});

	it('omits the popular name entirely when absent', () => {
		expect(plainOf(statute())).not.toContain(',');
	});
});

describe('assembleStatute: publisher and supplement', () => {
	it('renders an annotated code with a publisher', () => {
		expect(
			plainOf(statute({ code: 'U.S.C.A.', publisher: 'West', year: 2015 })),
		).toBe('17 U.S.C.A. § 107 (West 2015).');
	});

	it('renders a supplement-only citation with no base year', () => {
		const supplementOnly: SupplementStatute = {
			title: '17',
			code: 'U.S.C.',
			section: '107',
			materialLocation: 'supplement',
			supplementDesignation: 'Supp. I',
			supplementYear: 2014,
		};

		expect(plainOf(supplementOnly)).toBe('17 U.S.C. § 107 (Supp. I 2014).');
	});
});

// r[verify citation.statute-short-form]
describe('assembleStatuteShortForm', () => {
	it('matches the domain-spec.md 48 U.S.C. §§1411-12 worked example', () => {
		const { plain } = render(
			assembleStatuteShortForm({ code: 'U.S.C.', section: '§§ 1411-12' }),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('U.S.C. §§ 1411-12.');
	});

	it('includes the title before the code when present', () => {
		const { plain } = render(
			assembleStatuteShortForm({
				title: '17',
				code: 'U.S.C.',
				section: '107',
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe('17 U.S.C. § 107.');
	});

	it('drops any parenthetical entirely -- no date, no publisher', () => {
		const { plain } = render(
			assembleStatuteShortForm({ code: 'U.S.C.', section: '107' }),
			{ emphasis: 'italic' },
		);

		expect(plain).not.toContain('(');
	});
});
