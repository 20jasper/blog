import { applyFraming } from './render';
import { normalizeSection } from './section';
import { assembleStatuteParenthetical } from './statute-date';
import type { StatuteParentheticalInput } from './statute-date';
import type { Segment } from './types';

export type StatuteInput = {
	popularName?: string;
	title?: string;
	code: string;
	section: string;
} & StatuteParentheticalInput;

// r[impl citation.statute-long-form]
// r[impl statute.title]
export function assembleStatute(input: StatuteInput): Segment[] {
	const popularName =
		input.popularName === undefined ? '' : `${input.popularName}, `;
	const title = input.title === undefined ? '' : `${input.title} `;
	const parenthetical = assembleStatuteParenthetical(input);

	const segments: Segment[] = [
		{
			text: `${popularName}${title}${input.code} ${normalizeSection(input.section)} (${parenthetical})`,
		},
	];

	return applyFraming(segments, {
		capitalizeFirst: true,
		terminalPeriod: true,
	});
}

export type StatuteShortFormInput = {
	title?: string;
	code: string;
	section: string;
};

// r[impl citation.statute-short-form]
export function assembleStatuteShortForm(
	input: StatuteShortFormInput,
): Segment[] {
	const title = input.title === undefined ? '' : `${input.title} `;

	const segments: Segment[] = [
		{ text: `${title}${input.code} ${normalizeSection(input.section)}` },
	];

	return applyFraming(segments, {
		capitalizeFirst: true,
		terminalPeriod: true,
	});
}
