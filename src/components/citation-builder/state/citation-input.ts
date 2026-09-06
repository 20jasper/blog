import {
	assembleReportedCase,
	assembleReportedShortForm,
	assembleUnreportedCase,
	assembleUnreportedShortForm,
	assembleStatuteCase,
	type AssembleOptions,
	type ReportedCaseInput,
	type ReportedShortFormInput,
	type UnreportedCaseInput,
	type UnreportedShortFormInput,
	type StatuteInput,
} from '../domain/assemble';
import type { Segment } from '../domain/types';

// Statute short form isn't here yet -- deferred (see
// docs/citation-builder/phase-1-spec.md, chunk 8 note).
export type CitationInput =
	| { sourceType: 'reported'; mode: 'full'; input: ReportedCaseInput }
	| { sourceType: 'reported'; mode: 'short'; input: ReportedShortFormInput }
	| { sourceType: 'unreported'; mode: 'full'; input: UnreportedCaseInput }
	| {
			sourceType: 'unreported';
			mode: 'short';
			input: UnreportedShortFormInput;
	  }
	| { sourceType: 'statute'; mode: 'full'; input: StatuteInput };

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
			return assembleStatuteCase(citation.input);
	}
}
