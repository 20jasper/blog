import {
	assembleReportedCase,
	assembleReportedShortForm,
	assembleUnreportedCase,
	assembleUnreportedShortForm,
	assembleStatuteCase,
	assembleStatuteShortForm,
	type AssembleOptions,
	type ReportedCaseInput,
	type ReportedShortFormInput,
	type UnreportedCaseInput,
	type UnreportedShortFormInput,
	type StatuteInput,
	type StatuteShortFormInput,
} from '../domain/assemble';
import type { Segment } from '../domain/types';

export type CitationInput =
	| { sourceType: 'reported'; mode: 'full'; input: ReportedCaseInput }
	| { sourceType: 'reported'; mode: 'short'; input: ReportedShortFormInput }
	| { sourceType: 'unreported'; mode: 'full'; input: UnreportedCaseInput }
	| {
			sourceType: 'unreported';
			mode: 'short';
			input: UnreportedShortFormInput;
	  }
	| { sourceType: 'statute'; mode: 'full'; input: StatuteInput }
	| { sourceType: 'statute'; mode: 'short'; input: StatuteShortFormInput };

export function assemble(
	citation: CitationInput,
	options: AssembleOptions = {},
): Segment[] {
	switch (citation.sourceType) {
		case 'reported':
			return citation.mode === 'full'
				? assembleReportedCase(citation.input, options)
				: assembleReportedShortForm(citation.input, options);
		case 'unreported':
			return citation.mode === 'full'
				? assembleUnreportedCase(citation.input, options)
				: assembleUnreportedShortForm(citation.input, options);
		case 'statute':
			return citation.mode === 'full'
				? assembleStatuteCase(citation.input)
				: assembleStatuteShortForm(citation.input);
	}
}
