import { assembleCaseName, type CaseNameInput } from './case-types';
import { parsePincite, type PinciteOptions } from './pincite';
import { applyFraming } from './render';
import type { Segment } from './types';

export type SpanSeparator = PinciteOptions['separator'];

// r[impl normalize.span-separator]
const DEFAULT_SEPARATOR: SpanSeparator = '-';

// r[impl normalize.span-input]
function appendPincite(
	pincite: string | undefined,
	separator: SpanSeparator,
): Segment[] {
	if (pincite === undefined) {
		return [];
	}
	const parsed = parsePincite(pincite, { separator, starPages: false });
	return [{ text: `, ${parsed}`, emphasized: false }];
}

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
		{ text: assembleCaseName(input.name), emphasized: true },
		{
			text: `, ${input.volume} ${input.reporter} ${input.firstPage}`,
			emphasized: false,
		},
		...appendPincite(input.pincite, spanSeparator),
		{ text: ` (${parenthetical})`, emphasized: false },
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
	switch (nameVariant) {
		case 'party1':
			// only one party in in-re and ex-parte cases, as well as non-v formats
			return name.caseType === 'v' ? name.party1 : assembleCaseName(name);
		case 'party2':
			// only one party in in-re and ex-parte cases, as well as non-v formats
			return name.caseType === 'v' ? name.party2 : assembleCaseName(name);
		case 'full':
			// format both parties for full and v cases
			return assembleCaseName(name);
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

	if (input.nameVariant === 'id') {
		return framePeriod([
			{ text: 'Id.', emphasized: true },
			{ text: ` at ${pincite}`, emphasized: false },
		]);
	}

	const citeText = `${input.volume} ${input.reporter} at ${pincite}`;

	if (input.nameVariant === 'none') {
		return framePeriod([{ text: citeText, emphasized: false }]);
	}

	return framePeriod([
		{ text: shortFormName(input.nameVariant, input.name), emphasized: true },
		{ text: `, ${citeText}`, emphasized: false },
	]);
}
