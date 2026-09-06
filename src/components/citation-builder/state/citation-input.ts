import {
	assembleReportedCase,
	assembleReportedShortForm,
	assembleUnreportedCase,
	assembleStatuteCase,
	type ReportedCaseInput,
	type ReportedShortFormInput,
	type UnreportedCaseInput,
	type StatuteInput,
} from '../domain/assemble';
import type { Segment } from '../domain/types';

// Only the modes actually built so far (see docs/citation-builder/phase-1-spec.md
// open items): unreported and statute short form aren't here because no
// source has confirmed either yet.
export type CitationInput =
	| { sourceType: 'reported'; mode: 'full'; input: ReportedCaseInput }
	| { sourceType: 'reported'; mode: 'short'; input: ReportedShortFormInput }
	| { sourceType: 'unreported'; mode: 'full'; input: UnreportedCaseInput }
	| { sourceType: 'statute'; mode: 'full'; input: StatuteInput };

export function assemble(citation: CitationInput): Segment[] {
	switch (citation.sourceType) {
		case 'reported':
			return citation.mode === 'full'
				? assembleReportedCase(citation.input)
				: assembleReportedShortForm(citation.input);
		case 'unreported':
			return assembleUnreportedCase(citation.input);
		case 'statute':
			return assembleStatuteCase(citation.input);
	}
}
