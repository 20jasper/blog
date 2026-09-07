import { assembleCaseName, type CaseNameInput } from './case-types';
import { parsePincite, type PinciteOptions } from './pincite';
import { applyFraming } from './render';
import type { Segment } from './types';

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
