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
	switch (citation.mode) {
		case 'full':
			return assembleReportedCase(citation.input, options);
		case 'short':
			return assembleReportedShortForm(citation.input, options);
	}
}
