import { assembleCaseName, type CaseNameInput } from './case-types';
import {
	assembleDate,
	normalizeDocketNumber,
	normalizeSection,
} from './normalize';
import { parsePincite, type PinciteOptions } from './pincite';
import { applyFraming } from './render';
import type { DateParts, Segment } from './types';

export type SpanSeparator = PinciteOptions['separator'];

// r[impl normalize.span-separator]
const DEFAULT_SEPARATOR: SpanSeparator = '-';

// r[impl assemble.composable]
function nameSegment(name: CaseNameInput): Segment {
	return { text: assembleCaseName(name), emphasized: true };
}

// r[impl assemble.composable]
function maybeSegment(
	value: string | undefined,
	format: (value: string) => string,
): Segment[] {
	return value === undefined
		? []
		: [{ text: format(value), emphasized: false }];
}

// r[impl assemble.composable]
// r[impl normalize.span-input]
function appendPincite(
	pincite: string | undefined,
	separator: SpanSeparator,
): Segment[] {
	return maybeSegment(
		pincite,
		(value) => `, ${parsePincite(value, { separator, starPages: false })}`,
	);
}

// r[impl assemble.composable]
function framePeriod(segments: Segment[]): Segment[] {
	return applyFraming(segments, {
		capitalizeFirst: true,
		terminalPeriod: true,
	});
}

export type ReportedCaseInput = {
	name: CaseNameInput;
	volume: string;
	reporter: string;
	firstPage: string;
	pincite?: string;
	// r[impl court.optional]
	court?: string;
	year: number;
};

export type AssembleOptions = { spanSeparator?: SpanSeparator };

// r[impl citation.reported-long-form]
export function assembleReportedCase(
	input: ReportedCaseInput,
	{ spanSeparator = DEFAULT_SEPARATOR }: AssembleOptions = {},
): Segment[] {
	const parenthetical =
		input.court === undefined
			? `${input.year}`
			: `${input.court} ${input.year}`;

	const segments: Segment[] = [
		nameSegment(input.name),
		{
			text: `, ${input.volume} ${input.reporter} ${input.firstPage}`,
			emphasized: false,
		},
		...appendPincite(input.pincite, spanSeparator),
		{ text: ` (${parenthetical})`, emphasized: false },
	];

	return framePeriod(segments);
}

export type ReportedShortFormInput =
	| { nameVariant: 'id'; pincite: string }
	| { nameVariant: 'none'; volume: string; reporter: string; pincite: string }
	| {
			nameVariant: 'full' | 'party1' | 'party2';
			name: CaseNameInput;
			volume: string;
			reporter: string;
			pincite: string;
	  };

// r[impl case-name.short-form]
// r[impl short-form.party-choice]
function shortFormName(
	nameVariant: 'full' | 'party1' | 'party2',
	name: CaseNameInput,
): string {
	// In re/Ex parte have only one party -- Party 1/Party 2 collapse to the
	// same assembled name regardless of which the user picked.
	if (nameVariant === 'full' || name.caseType !== 'v') {
		return assembleCaseName(name);
	}
	return nameVariant === 'party1' ? name.party1 : name.party2;
}

// r[impl citation.reported-short-form]
export function assembleReportedShortForm(
	input: ReportedShortFormInput,
	{ spanSeparator = DEFAULT_SEPARATOR }: AssembleOptions = {},
): Segment[] {
	const pincite = parsePincite(input.pincite, {
		separator: spanSeparator,
		starPages: false,
	});

	if (input.nameVariant === 'id') {
		return framePeriod([
			{ text: 'Id.', emphasized: true },
			{ text: ` at ${pincite}`, emphasized: false },
		]);
	}

	const nameSeg: Segment[] =
		input.nameVariant === 'none'
			? []
			: [
					{
						text: shortFormName(input.nameVariant, input.name),
						emphasized: true,
					},
				];

	const core =
		nameSeg.length === 0
			? `${input.volume} ${input.reporter} at ${pincite}`
			: `, ${input.volume} ${input.reporter} at ${pincite}`;

	return framePeriod([...nameSeg, { text: core, emphasized: false }]);
}

export type Availability =
	{ kind: 'database'; databaseId: string } | { kind: 'slip-opinion' };

export type UnreportedCaseInput = {
	name: CaseNameInput;
	docket: string;
	availability: Availability;
	pincite?: string;
	court: string;
	date: DateParts;
};

// r[impl assemble.composable]
function appendDatabaseId(availability: Availability): Segment[] {
	const databaseId =
		availability.kind === 'database' ? availability.databaseId : undefined;
	return maybeSegment(databaseId, (value) => `, ${value}`);
}

// r[impl citation.unreported-pincite-form]
// r[impl normalize.span-input]
function appendUnreportedPincite(
	pincite: string | undefined,
	availability: Availability,
	separator: SpanSeparator,
): Segment[] {
	return maybeSegment(pincite, (value) => {
		const parsed = parsePincite(value, {
			separator,
			starPages: availability.kind === 'database',
		});
		return availability.kind === 'database'
			? `, at ${parsed}`
			: `, slip op. at ${parsed}`;
	});
}

// r[impl citation.unreported-long-form]
export function assembleUnreportedCase(
	input: UnreportedCaseInput,
	{ spanSeparator = DEFAULT_SEPARATOR }: AssembleOptions = {},
): Segment[] {
	const segments: Segment[] = [
		nameSegment(input.name),
		{ text: `, ${normalizeDocketNumber(input.docket)}`, emphasized: false },
		...appendDatabaseId(input.availability),
		...appendUnreportedPincite(
			input.pincite,
			input.availability,
			spanSeparator,
		),
		{
			text: ` (${input.court} ${assembleDate(input.date)})`,
			emphasized: false,
		},
	];

	return framePeriod(segments);
}

type UnreportedShortFormAvailability =
	| { kind: 'database'; databaseId: string }
	| { kind: 'slip-opinion'; docket: string };

export type UnreportedShortFormInput =
	| {
			nameVariant: 'id';
			availability: UnreportedShortFormAvailability;
			pincite: string;
	  }
	| {
			nameVariant: 'none';
			availability: UnreportedShortFormAvailability;
			pincite: string;
	  }
	| {
			nameVariant: 'full' | 'party1' | 'party2';
			name: CaseNameInput;
			availability: UnreportedShortFormAvailability;
			pincite: string;
	  };

// r[impl citation.unreported-short-form]
// r[impl citation.unreported-pincite-form]
export function assembleUnreportedShortForm(
	input: UnreportedShortFormInput,
	{ spanSeparator = DEFAULT_SEPARATOR }: AssembleOptions = {},
): Segment[] {
	const pincite = parsePincite(input.pincite, {
		separator: spanSeparator,
		starPages: input.availability.kind === 'database',
	});

	if (input.nameVariant === 'id') {
		return framePeriod([
			{ text: 'Id.', emphasized: true },
			{ text: ` at ${pincite}`, emphasized: false },
		]);
	}

	const nameSeg: Segment[] =
		input.nameVariant === 'none'
			? []
			: [
					{
						text: shortFormName(input.nameVariant, input.name),
						emphasized: true,
					},
				];

	const availabilitySegment =
		input.availability.kind === 'database'
			? `${input.availability.databaseId}, at ${pincite}`
			: `No. ${input.availability.docket}, slip op. at ${pincite}`;

	const core =
		nameSeg.length === 0 ? availabilitySegment : `, ${availabilitySegment}`;

	return framePeriod([...nameSeg, { text: core, emphasized: false }]);
}

export type StatuteTitle = {
	text: string;
	position: 'before-code' | 'after-code';
};

type Supplement = { designation: string; year: number };

// r[impl statute.material-location]
// r[impl statute.supplement-pairing]
export type MaterialLocation =
	| { kind: 'main-volume'; year: number }
	| { kind: 'both'; year: number; supplement: Supplement }
	| { kind: 'supplement-only'; supplement: Supplement };

// r[impl statute.supplement-scope]
export type StatuteInput = (
	| {
			codeType: 'official';
			codeAbbreviation: string;
			section: string;
			materialLocation: MaterialLocation;
	  }
	| {
			codeType: 'annotated';
			codeAbbreviation: string;
			section: string;
			publisher: string;
			materialLocation: MaterialLocation;
	  }
) & {
	popularName?: string;
	title?: StatuteTitle;
};

// r[impl statute.material-location]
// r[impl statute.supplement-designation-freeform]
function materialLocationYear(materialLocation: MaterialLocation): string {
	switch (materialLocation.kind) {
		case 'main-volume':
			return `${materialLocation.year}`;
		case 'both':
			return `${materialLocation.year} & ${materialLocation.supplement.designation} ${materialLocation.supplement.year}`;
		case 'supplement-only':
			return `${materialLocation.supplement.designation} ${materialLocation.supplement.year}`;
	}
}

// r[impl statute.title]
function codeWithTitle(
	codeAbbreviation: string,
	title: StatuteTitle | undefined,
): string {
	if (title === undefined) {
		return codeAbbreviation;
	}
	return title.position === 'before-code'
		? `${title.text} ${codeAbbreviation}`
		: `${codeAbbreviation} ${title.text},`;
}

// r[impl statute.popular-name]
function popularNamePrefix(popularName: string | undefined): string {
	return popularName === undefined ? '' : `${popularName}, `;
}

// r[impl citation.statute-long-form]
// r[impl citation.statute-supplement]
export function assembleStatuteCase(input: StatuteInput): Segment[] {
	const parenthetical =
		input.codeType === 'official'
			? materialLocationYear(input.materialLocation)
			: `${input.publisher} ${materialLocationYear(input.materialLocation)}`;

	const segments: Segment[] = [
		{
			text: `${popularNamePrefix(input.popularName)}${codeWithTitle(input.codeAbbreviation, input.title)} ${normalizeSection(input.section)} (${parenthetical})`,
			emphasized: false,
		},
	];

	return framePeriod(segments);
}

// r[impl citation.statute-short-form]
export type StatuteShortFormInput = {
	codeAbbreviation: string;
	section: string;
	popularName?: string;
	title?: StatuteTitle;
};

// Drops the entire parenthetical -- publisher, year, and any supplement.
// No name variant applies (statutes have no case name) and no pincite is
// appended: the statutory pinpoint is the subsection, already part of
// the Section field.
export function assembleStatuteShortForm(
	input: StatuteShortFormInput,
): Segment[] {
	const segments: Segment[] = [
		{
			text: `${popularNamePrefix(input.popularName)}${codeWithTitle(input.codeAbbreviation, input.title)} ${normalizeSection(input.section)}`,
			emphasized: false,
		},
	];

	return framePeriod(segments);
}
