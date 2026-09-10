import type { Availability } from './availability';
import { assembleCaseName, type CaseNameInput } from './case-types';
import { assembleDate } from './date';
import { normalizeDocket } from './docket';
import type { Month } from './months';
import { HYPHEN, parsePincite } from './pincite';
import { applyFraming } from './render';
import type { Segment } from './types';
import type { SpanSeparator } from './pincite';

export type { SpanSeparator };

// r[impl normalize.span-separator]
const DEFAULT_SEPARATOR: SpanSeparator = HYPHEN;

function framePeriod(segments: Segment[]): Segment[] {
	return applyFraming(segments, {
		capitalizeFirst: true,
		terminalPeriod: true,
	});
}

// r[impl weight-of-authority.parenthetical]
function weightOfAuthoritySuffix(
	weightOfAuthority: string | undefined,
): string {
	return weightOfAuthority === undefined ? '' : ` (${weightOfAuthority})`;
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
	weightOfAuthority?: string;
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

	// r[impl normalize.span-input]
	const pincite =
		input.pincite === undefined
			? []
			: [
					{
						text: `, ${parsePincite(input.pincite, { separator: spanSeparator, starPages: false })}`,
					},
				];

	const segments: Segment[] = [
		{ text: assembleCaseName(input.name), emphasized: true },
		{ text: `, ${input.volume} ${input.reporter} ${input.firstPage}` },
		...pincite,
		{
			text: ` (${parenthetical})${weightOfAuthoritySuffix(input.weightOfAuthority)}`,
		},
	];

	return framePeriod(segments);
}

export type UnreportedCaseInput = {
	name: CaseNameInput;
	docket: string;
	pincite?: string;
	court?: string;
	month: Month;
	day: number;
	year: number;
	weightOfAuthority?: string;
} & (
	| { availability: 'database'; databaseId: string }
	| { availability: 'slip' }
	// r[impl unreported.online-only]
	| { availability: 'online'; url: string }
);

function unreportedTail(
	input: UnreportedCaseInput,
	pincite: string | undefined,
): Segment[] {
	switch (input.availability) {
		case 'database':
			return [
				{ text: `, ${input.databaseId}` },
				...(pincite === undefined ? [] : [{ text: `, at ${pincite}` }]),
			];
		case 'slip':
		case 'online':
			return pincite === undefined
				? []
				: [{ text: `, slip op. at ${pincite}` }];
	}
}

// r[impl citation.unreported-long-form]
// r[impl citation.unreported-pincite-form]
export function assembleUnreportedCase(
	input: UnreportedCaseInput,
	{ spanSeparator = DEFAULT_SEPARATOR }: AssembleOptions = {},
): Segment[] {
	const date = assembleDate(input.month, input.day, input.year);
	const parenthetical =
		input.court === undefined ? date : `${input.court} ${date}`;

	const pincite =
		input.pincite === undefined
			? undefined
			: parsePincite(input.pincite, {
					separator: spanSeparator,
					starPages: input.availability === 'database',
				});

	const segments: Segment[] = [
		{ text: assembleCaseName(input.name), emphasized: true },
		{ text: `, ${normalizeDocket(input.docket)}` },
		...unreportedTail(input, pincite),
		{
			text: ` (${parenthetical})${weightOfAuthoritySuffix(input.weightOfAuthority)}`,
		},
		...(input.availability === 'online' ? [{ text: `, ${input.url}` }] : []),
	];

	return framePeriod(segments);
}

export type PartyChoice = 'full' | 'party1' | 'party2';

export type ReportedShortFormInput = { pincite: string } & (
	| { nameVariant: 'id' }
	| { nameVariant: 'none'; volume: string; reporter: string }
	| {
			nameVariant: PartyChoice;
			name: CaseNameInput;
			volume: string;
			reporter: string;
	  }
);

// r[impl case-name.short-form]
// r[impl short-form.party-choice]
function shortFormName(nameVariant: PartyChoice, name: CaseNameInput): string {
	switch (name.caseType) {
		// only one party in in-re and ex-parte cases, regardless of variant
		case 'in-re':
		case 'ex-parte':
			return assembleCaseName(name);
		case 'v':
			switch (nameVariant) {
				case 'full':
					return assembleCaseName(name);
				case 'party1':
					return name.party1;
				case 'party2':
					return name.party2;
			}
	}
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

	switch (input.nameVariant) {
		case 'id':
			return framePeriod([
				{ text: 'Id.', emphasized: true },
				{ text: ` at ${pincite}` },
			]);
		case 'none':
			return framePeriod([
				{ text: `${input.volume} ${input.reporter} at ${pincite}` },
			]);
		case 'full':
		case 'party1':
		case 'party2':
			return framePeriod([
				{
					text: shortFormName(input.nameVariant, input.name),
					emphasized: true,
				},
				{ text: `, ${input.volume} ${input.reporter} at ${pincite}` },
			]);
	}
}

type UnreportedIdentifier =
	| { availability: 'database'; databaseId: string }
	| { availability: 'slip' | 'online'; docket: string };

function unreportedIdentifierText(input: UnreportedIdentifier): string {
	switch (input.availability) {
		case 'database':
			return input.databaseId;
		case 'slip':
		case 'online':
			return normalizeDocket(input.docket);
	}
}

function unreportedAtText(availability: Availability, pincite: string): string {
	switch (availability) {
		case 'database':
			return `at ${pincite}`;
		case 'slip':
		case 'online':
			return `slip op. at ${pincite}`;
	}
}

export type UnreportedShortFormInput = { pincite: string } & (
	| { nameVariant: 'id'; availability: Availability }
	| ({ nameVariant: 'none' } & UnreportedIdentifier)
	| ({ nameVariant: PartyChoice; name: CaseNameInput } & UnreportedIdentifier)
);

// r[impl citation.unreported-short-form]
export function assembleUnreportedShortForm(
	input: UnreportedShortFormInput,
	{ spanSeparator = DEFAULT_SEPARATOR }: AssembleOptions = {},
): Segment[] {
	const pincite = parsePincite(input.pincite, {
		separator: spanSeparator,
		starPages: input.availability === 'database',
	});

	switch (input.nameVariant) {
		// r[impl id.gating]
		case 'id':
			return framePeriod([
				{ text: 'Id.', emphasized: true },
				{ text: ` at ${pincite}` },
			]);
		case 'none':
			return framePeriod([
				{
					text: `${unreportedIdentifierText(input)}, ${unreportedAtText(input.availability, pincite)}`,
				},
			]);
		case 'full':
		case 'party1':
		case 'party2':
			return framePeriod([
				{
					text: shortFormName(input.nameVariant, input.name),
					emphasized: true,
				},
				{
					text: `, ${unreportedIdentifierText(input)}, ${unreportedAtText(input.availability, pincite)}`,
				},
			]);
	}
}
