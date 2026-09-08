import { assembleCaseName, type CaseNameInput } from './case-types';
import { HYPHEN, parsePincite, type PinciteOptions } from './pincite';
import { applyFraming } from './render';
import type { Segment } from './types';

export type SpanSeparator = PinciteOptions['separator'];

// r[impl normalize.span-separator]
const DEFAULT_SEPARATOR: SpanSeparator = HYPHEN;

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
		{ text: ` (${parenthetical})` },
	];

	return framePeriod(segments);
}

type PartyChoice = 'full' | 'party1' | 'party2';

export type ReportedShortFormInput =
	| { nameVariant: 'id'; pincite: string }
	| { nameVariant: 'none'; volume: string; reporter: string; pincite: string }
	| {
			nameVariant: PartyChoice;
			name: CaseNameInput;
			volume: string;
			reporter: string;
			pincite: string;
	  };

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
