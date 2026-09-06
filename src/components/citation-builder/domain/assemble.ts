import { assembleCaseName, type CaseNameInput } from './case-types';
import {
	assembleDate,
	normalizeDocketNumber,
	normalizeSection,
} from './normalize';
import { applyFraming } from './render';
import type { DateParts, Segment } from './types';

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
function appendPincite(pincite: string | undefined): Segment[] {
	return maybeSegment(pincite, (value) => `, ${value}`);
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

// r[impl citation.reported-long-form]
export function assembleReportedCase(input: ReportedCaseInput): Segment[] {
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
		...appendPincite(input.pincite),
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
): Segment[] {
	if (input.nameVariant === 'id') {
		return framePeriod([
			{ text: 'Id.', emphasized: true },
			{ text: ` at ${input.pincite}`, emphasized: false },
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
			? `${input.volume} ${input.reporter} at ${input.pincite}`
			: `, ${input.volume} ${input.reporter} at ${input.pincite}`;

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

// r[impl assemble.composable]
function appendStarPincite(pincite: string | undefined): Segment[] {
	return maybeSegment(pincite, (value) => `, at *${value}`);
}

// r[impl citation.unreported-long-form]
export function assembleUnreportedCase(input: UnreportedCaseInput): Segment[] {
	const segments: Segment[] = [
		nameSegment(input.name),
		{ text: `, ${normalizeDocketNumber(input.docket)}`, emphasized: false },
		...appendDatabaseId(input.availability),
		...appendStarPincite(input.pincite),
		{
			text: ` (${input.court} ${assembleDate(input.date)})`,
			emphasized: false,
		},
	];

	return framePeriod(segments);
}

export type StatuteInput =
	| {
			codeType: 'official';
			codeAbbreviation: string;
			section: string;
			year: number;
	  }
	| {
			codeType: 'annotated';
			codeAbbreviation: string;
			section: string;
			publisher: string;
			year: number;
			supplement: { designation: string; year: number } | undefined;
	  };

function supplementSuffix(
	supplement: { designation: string; year: number } | undefined,
): string {
	return supplement === undefined
		? ''
		: ` & ${supplement.designation} ${supplement.year}`;
}

// r[impl citation.statute-long-form]
export function assembleStatuteCase(input: StatuteInput): Segment[] {
	const parenthetical =
		input.codeType === 'official'
			? `${input.year}`
			: `${input.publisher} ${input.year}${supplementSuffix(input.supplement)}`;

	const segments: Segment[] = [
		{
			text: `${input.codeAbbreviation} ${normalizeSection(input.section)} (${parenthetical})`,
			emphasized: false,
		},
	];

	return framePeriod(segments);
}
