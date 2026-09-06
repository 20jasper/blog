import {
	assembleCaseName,
	shortCaseName,
	type CaseNameInput,
} from './case-types';
import {
	assembleDate,
	normalizeDocketNumber,
	normalizeSection,
} from './normalize';
import { applyFraming } from './render';
import type { DateParts, Segment } from './types';

// r[impl assemble.composable]
function nameSegment(name: CaseNameInput): Segment {
	return { text: assembleCaseName(name), italic: true };
}

// r[impl assemble.composable]
function appendPincite(pincite: string | undefined): Segment[] {
	return pincite === undefined ? [] : [{ text: `, ${pincite}`, italic: false }];
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
	court: string;
	year: number;
};

// r[impl citation.reported-long-form]
export function assembleReportedCase(input: ReportedCaseInput): Segment[] {
	const segments: Segment[] = [
		nameSegment(input.name),
		{
			text: `, ${input.volume} ${input.reporter} ${input.firstPage}`,
			italic: false,
		},
		...appendPincite(input.pincite),
		{ text: ` (${input.court} ${input.year})`, italic: false },
	];

	return framePeriod(segments);
}

export type ReportedShortFormInput =
	| { nameVariant: 'id'; pincite: string }
	| { nameVariant: 'none'; volume: string; reporter: string; pincite: string }
	| {
			nameVariant: 'full' | 'short';
			name: CaseNameInput;
			volume: string;
			reporter: string;
			pincite: string;
	  };

// r[impl citation.reported-short-form]
export function assembleReportedShortForm(
	input: ReportedShortFormInput,
): Segment[] {
	if (input.nameVariant === 'id') {
		return framePeriod([
			{ text: 'Id.', italic: true },
			{ text: ` at ${input.pincite}`, italic: false },
		]);
	}

	const nameSeg: Segment[] =
		input.nameVariant === 'none'
			? []
			: [
					{
						text:
							input.nameVariant === 'full'
								? assembleCaseName(input.name)
								: shortCaseName(input.name),
						italic: true,
					},
				];

	const core =
		nameSeg.length === 0
			? `${input.volume} ${input.reporter} at ${input.pincite}`
			: `, ${input.volume} ${input.reporter} at ${input.pincite}`;

	return framePeriod([...nameSeg, { text: core, italic: false }]);
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
	return availability.kind === 'database'
		? [{ text: `, ${availability.databaseId}`, italic: false }]
		: [];
}

// r[impl assemble.composable]
function appendStarPincite(pincite: string | undefined): Segment[] {
	return pincite === undefined
		? []
		: [{ text: `, at *${pincite}`, italic: false }];
}

// r[impl citation.unreported-long-form]
export function assembleUnreportedCase(input: UnreportedCaseInput): Segment[] {
	const segments: Segment[] = [
		nameSegment(input.name),
		{ text: `, ${normalizeDocketNumber(input.docket)}`, italic: false },
		...appendDatabaseId(input.availability),
		...appendStarPincite(input.pincite),
		{ text: ` (${input.court} ${assembleDate(input.date)})`, italic: false },
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

// r[impl citation.statute-long-form]
export function assembleStatuteCase(input: StatuteInput): Segment[] {
	const parenthetical =
		input.codeType === 'official'
			? `${input.year}`
			: `${input.publisher} ${input.year}${
					input.supplement === undefined
						? ''
						: ` & ${input.supplement.designation} ${input.supplement.year}`
				}`;

	const segments: Segment[] = [
		{
			text: `${input.codeAbbreviation} ${normalizeSection(input.section)} (${parenthetical})`,
			italic: false,
		},
	];

	return framePeriod(segments);
}
