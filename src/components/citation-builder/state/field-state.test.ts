import { describe, expect, it } from 'vitest';
import { selectFieldState } from './field-state';
import type { Selections } from './field-state';

// r[verify field-state.derivation]
describe('selectFieldState: shared case-type fields', () => {
	it('party2 is required when caseType is v', () => {
		const selections: Selections = {
			sourceType: 'reported',
			mode: 'full',
			caseType: 'v',
		};

		expect(selectFieldState(selections).party2).toBe('required');
	});

	it.each(['in-re', 'ex-parte'] as const)(
		'party2 is not-used when caseType is %s',
		(caseType) => {
			const selections: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType,
			};

			expect(selectFieldState(selections).party2).toBe('not-used');
		},
	);

	it.each(['caseType', 'party1'] as const)(
		'%s is always required for a case-type source (reported/unreported)',
		(field) => {
			const selections: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType: 'v',
			};

			expect(selectFieldState(selections)[field]).toBe('required');
		},
	);

	// r[verify court.optional]
	it('court is optional (not required), per r[court.optional]', () => {
		const selections: Selections = {
			sourceType: 'reported',
			mode: 'full',
			caseType: 'v',
		};

		expect(selectFieldState(selections).court).toBe('optional');
	});
});

// Neither short-form domain type (ReportedShortFormInput,
// UnreportedShortFormInput) has a court field at all -- court drops out
// of both short forms, and is required (not merely optional) for
// unreported full, since UnreportedCaseInput.court is non-optional.
describe('selectFieldState: court depends on source type and mode (§5.7, §5.8)', () => {
	it.each([
		['reported', 'full', 'optional'],
		['reported', 'short', 'not-used'],
		['unreported', 'full', 'required'],
		['unreported', 'short', 'not-used'],
	] as const)('%s + %s -> court %s', (sourceType, mode, expected) => {
		const selections: Selections =
			sourceType === 'reported'
				? { sourceType, mode, caseType: 'v' }
				: {
						sourceType,
						mode,
						caseType: 'v',
						availabilityKind: 'database',
					};

		expect(selectFieldState(selections).court).toBe(expected);
	});
});

// Neither short-form domain type carries a date at all -- Month/Day/
// Opinion year only apply to unreported full.
describe('selectFieldState: date fields only apply to unreported full (§5.8)', () => {
	it.each(['month', 'day', 'dateYear'] as const)(
		'%s is required for unreported full, not-used for unreported short',
		(field) => {
			const full: Selections = {
				sourceType: 'unreported',
				mode: 'full',
				caseType: 'v',
				availabilityKind: 'database',
			};
			const short: Selections = {
				sourceType: 'unreported',
				mode: 'short',
				caseType: 'v',
				availabilityKind: 'database',
			};

			expect(selectFieldState(full)[field]).toBe('required');
			expect(selectFieldState(short)[field]).toBe('not-used');
		},
	);

	it.each(['month', 'day', 'dateYear'] as const)(
		'%s is not-used for reported and statute',
		(field) => {
			const reported: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType: 'v',
			};
			const statute: Selections = {
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main-volume',
			};

			expect(selectFieldState(reported)[field]).toBe('not-used');
			expect(selectFieldState(statute)[field]).toBe('not-used');
		},
	);
});

describe('selectFieldState: reported-only fields (§3.2)', () => {
	it.each(['volume', 'reporter', 'firstPage'] as const)(
		'%s is required for reported full, not-used for unreported and statute',
		(field) => {
			const reported: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType: 'v',
			};
			const unreported: Selections = {
				sourceType: 'unreported',
				mode: 'full',
				caseType: 'v',
				availabilityKind: 'database',
			};
			const statute: Selections = {
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main-volume',
			};

			expect(selectFieldState(reported)[field]).toBe('required');
			expect(selectFieldState(unreported)[field]).toBe('not-used');
			expect(selectFieldState(statute)[field]).toBe('not-used');
		},
	);

	// No ReportedShortFormInput variant carries a first page -- unlike
	// volume/reporter, which short form still needs (except nameVariant
	// 'id', a display-state choice not modeled here).
	it.each([
		['full', 'required'],
		['short', 'not-used'],
	] as const)('mode %s -> firstPage %s', (mode, expected) => {
		const reported: Selections = {
			sourceType: 'reported',
			mode,
			caseType: 'v',
		};

		expect(selectFieldState(reported).firstPage).toBe(expected);
	});
});

describe('selectFieldState: unreported-only fields (§3.3)', () => {
	it.each(['availability', 'docketNumber', 'month', 'day'] as const)(
		'%s is required for unreported, not-used for reported and statute',
		(field) => {
			const reported: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType: 'v',
			};
			const unreported: Selections = {
				sourceType: 'unreported',
				mode: 'full',
				caseType: 'v',
				availabilityKind: 'database',
			};
			const statute: Selections = {
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main-volume',
			};

			expect(selectFieldState(unreported)[field]).toBe('required');
			expect(selectFieldState(reported)[field]).toBe('not-used');
			expect(selectFieldState(statute)[field]).toBe('not-used');
		},
	);

	it.each([
		['database', 'required'],
		['slip-opinion', 'not-used'],
	] as const)(
		'availability %s -> databaseIdentifier %s (both modes)',
		(availabilityKind, expected) => {
			const full: Selections = {
				sourceType: 'unreported',
				mode: 'full',
				caseType: 'v',
				availabilityKind,
			};
			const short: Selections = {
				sourceType: 'unreported',
				mode: 'short',
				caseType: 'v',
				availabilityKind,
			};

			expect(selectFieldState(full).databaseIdentifier).toBe(expected);
			expect(selectFieldState(short).databaseIdentifier).toBe(expected);
		},
	);

	// r[verify citation.unreported-short-form]
	it.each([
		['full', 'database', 'required'],
		['full', 'slip-opinion', 'required'],
		['short', 'database', 'not-used'],
		['short', 'slip-opinion', 'required'],
	] as const)(
		'mode %s, availability %s -> docketNumber %s',
		(mode, availabilityKind, expected) => {
			const selections: Selections = {
				sourceType: 'unreported',
				mode,
				caseType: 'v',
				availabilityKind,
			};

			expect(selectFieldState(selections).docketNumber).toBe(expected);
		},
	);
});

describe('selectFieldState: statute-only fields (§3.4)', () => {
	const REPORTED: Selections = {
		sourceType: 'reported',
		mode: 'full',
		caseType: 'v',
	};
	const UNREPORTED: Selections = {
		sourceType: 'unreported',
		mode: 'full',
		caseType: 'v',
		availabilityKind: 'database',
	};

	it.each(['codeType', 'codeAbbreviation', 'section'] as const)(
		'%s is required for statute, not-used for reported and unreported',
		(field) => {
			const statute: Selections = {
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main-volume',
			};

			expect(selectFieldState(statute)[field]).toBe('required');
			expect(selectFieldState(REPORTED)[field]).toBe('not-used');
			expect(selectFieldState(UNREPORTED)[field]).toBe('not-used');
		},
	);

	it.each([
		['official', 'not-used'],
		['annotated', 'required'],
	] as const)('codeType %s -> publisher %s', (codeType, expected) => {
		const selections: Selections = {
			sourceType: 'statute',
			mode: 'full',
			codeType,
			materialLocation: 'main-volume',
		};

		expect(selectFieldState(selections).publisher).toBe(expected);
	});

	// r[verify statute.material-location]
	// Material location is its own required select (§3.4) -- not inferred
	// from which fields happen to be filled. It drives codeYear (required
	// unless supplement-only) and supplementDesignation/supplementYear
	// (required unless main-volume) -- disabled, not merely optional, at
	// the opposite end, per §3.4's table.
	it.each([
		['main-volume', 'required'],
		['both', 'required'],
		['supplement-only', 'not-used'],
	] as const)(
		'materialLocation %s -> codeYear %s',
		(materialLocation, expected) => {
			const selections: Selections = {
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation,
			};

			expect(selectFieldState(selections).codeYear).toBe(expected);
		},
	);

	// r[verify statute.supplement-pairing]
	it.each([
		['main-volume', 'not-used'],
		['both', 'required'],
		['supplement-only', 'required'],
	] as const)(
		'materialLocation %s -> supplementDesignation/supplementYear %s',
		(materialLocation, expected) => {
			const selections: Selections = {
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation,
			};

			expect(selectFieldState(selections).supplementDesignation).toBe(expected);
			expect(selectFieldState(selections).supplementYear).toBe(expected);
		},
	);

	// r[verify citation.statute-short-form]
	// Short form drops the entire parenthetical -- publisher, materialLocation,
	// codeYear, and any supplement -- keeping only codeType-independent
	// codeAbbreviation/section.
	it.each([
		'codeType',
		'publisher',
		'materialLocation',
		'codeYear',
		'supplementDesignation',
		'supplementYear',
	] as const)('%s is not-used for statute short form', (field) => {
		const selections: Selections = {
			sourceType: 'statute',
			mode: 'short',
			codeType: 'annotated',
			materialLocation: 'both',
		};

		expect(selectFieldState(selections)[field]).toBe('not-used');
	});

	it.each(['codeAbbreviation', 'section'] as const)(
		'%s stays required for statute short form',
		(field) => {
			const selections: Selections = {
				sourceType: 'statute',
				mode: 'short',
				codeType: 'annotated',
				materialLocation: 'both',
			};

			expect(selectFieldState(selections)[field]).toBe('required');
		},
	);
});

// "Year" (CitationFields.year) is the reported-only Decision year field --
// unreported has its own separate date-year field (dateYear, "Opinion
// year" in the UI), and neither short form nor statute uses this one at
// all.
describe('selectFieldState: year is reported-full only', () => {
	it.each([
		[{ sourceType: 'reported', mode: 'full', caseType: 'v' }, 'required'],
		[{ sourceType: 'reported', mode: 'short', caseType: 'v' }, 'not-used'],
		[
			{
				sourceType: 'unreported',
				mode: 'full',
				caseType: 'v',
				availabilityKind: 'database',
			},
			'not-used',
		],
		[
			{
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main-volume',
			},
			'not-used',
		],
	] as const satisfies [Selections, string][])(
		'%#: year -> %s',
		(selections, expected) => {
			expect(selectFieldState(selections).year).toBe(expected);
		},
	);
});

describe('selectFieldState: pincite mode rule (§3.1)', () => {
	it.each([
		['full', 'optional'],
		['short', 'required'],
	] as const)('mode %s -> pincite %s', (mode, expected) => {
		const selections: Selections = {
			sourceType: 'reported',
			mode,
			caseType: 'v',
		};

		expect(selectFieldState(selections).pincite).toBe(expected);
	});
});

describe('selectFieldState: case-type fields are not-used for statute', () => {
	it.each(['caseType', 'party1', 'party2', 'court', 'pincite'] as const)(
		'%s is not-used when sourceType is statute',
		(field) => {
			const selections: Selections = {
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main-volume',
			};

			expect(selectFieldState(selections)[field]).toBe('not-used');
		},
	);
});
