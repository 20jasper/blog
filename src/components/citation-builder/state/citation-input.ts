import {
	assembleReportedCase,
	assembleReportedShortForm,
	type AssembleOptions,
	type ReportedCaseInput,
	type ReportedShortFormInput,
} from '../domain/assemble';
import type { Segment } from '../domain/types';

export type CitationInput =
	| { mode: 'full'; input: ReportedCaseInput }
	| { mode: 'short'; input: ReportedShortFormInput };

export function assemble(
	citation: CitationInput,
	options: AssembleOptions = {},
): Segment[] {
	return citation.mode === 'full'
		? assembleReportedCase(citation.input, options)
		: assembleReportedShortForm(citation.input, options);
}
