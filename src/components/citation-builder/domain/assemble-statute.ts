import { applyFraming } from './render';
import { normalizeSection } from './section';
import { assembleStatuteParenthetical } from './statute-date';
import type { StatuteParentheticalInput } from './statute-date';
import type { Segment } from './types';

// r[impl statute.title]
function titlePrefix(title: string | undefined): string {
	return title === undefined ? '' : `${title} `;
}

function codeSection(code: string, section: string): string {
	return `${code} ${normalizeSection(section)}`;
}

export type StatuteInput = {
	popularName?: string;
	title?: string;
	code: string;
	section: string;
} & StatuteParentheticalInput;

// r[impl citation.statute-long-form]
export function assembleStatute(input: StatuteInput): Segment[] {
	const popularName =
		input.popularName === undefined ? '' : `${input.popularName}, `;
	const parenthetical = assembleStatuteParenthetical(input);

	const segments: Segment[] = [
		{
			text: `${popularName}${titlePrefix(input.title)}${codeSection(input.code, input.section)} (${parenthetical})`,
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
	const segments: Segment[] = [
		{
			text: `${titlePrefix(input.title)}${codeSection(input.code, input.section)}`,
		},
	];

	return applyFraming(segments, {
		capitalizeFirst: true,
		terminalPeriod: true,
	});
}
