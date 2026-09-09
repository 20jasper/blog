import {
	assembleReportedCase,
	assembleReportedShortForm,
	assembleUnreportedCase,
	assembleUnreportedShortForm,
	type AssembleOptions,
	type ReportedCaseInput,
	type ReportedShortFormInput,
	type UnreportedCaseInput,
	type UnreportedShortFormInput,
} from '../domain/assemble';
import {
	assembleStatute,
	assembleStatuteShortForm,
	type StatuteInput,
	type StatuteShortFormInput,
} from '../domain/assemble-statute';
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

type Reported = Extract<CitationInput, { sourceType: 'reported' }>;
type Unreported = Extract<CitationInput, { sourceType: 'unreported' }>;
type Statute = Extract<CitationInput, { sourceType: 'statute' }>;

function assembleReported(
	citation: Reported,
	options: AssembleOptions,
): Segment[] {
	switch (citation.mode) {
		case 'full':
			return assembleReportedCase(citation.input, options);
		case 'short':
			return assembleReportedShortForm(citation.input, options);
	}
}

function assembleUnreported(
	citation: Unreported,
	options: AssembleOptions,
): Segment[] {
	switch (citation.mode) {
		case 'full':
			return assembleUnreportedCase(citation.input, options);
		case 'short':
			return assembleUnreportedShortForm(citation.input, options);
	}
}

function assembleStatuteCitation(citation: Statute): Segment[] {
	switch (citation.mode) {
		case 'full':
			return assembleStatute(citation.input);
		case 'short':
			return assembleStatuteShortForm(citation.input);
	}
}

export function assemble(
	citation: CitationInput,
	options: AssembleOptions = {},
): Segment[] {
	switch (citation.sourceType) {
		case 'reported':
			return assembleReported(citation, options);
		case 'unreported':
			return assembleUnreported(citation, options);
		case 'statute':
			return assembleStatuteCitation(citation);
	}
}
