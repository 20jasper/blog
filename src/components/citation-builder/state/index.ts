// Barrel so the view depends on "the state layer," not five separate files.

export { AVAILABILITIES, isAvailability } from '../domain/availability';
export type { Availability } from '../domain/availability';
export { SIGNALS, isSignal } from '../domain/signal';
export type { Signal } from '../domain/signal';

export { isCaseTypeId } from '../domain/case-types';
export type { CaseTypeId } from '../domain/case-types';

export { CODE_TYPES, isCodeType } from '../domain/code-type';
export type { CodeType } from '../domain/code-type';

export {
	isMaterialLocation,
	MATERIAL_LOCATIONS,
} from '../domain/material-location';
export type { MaterialLocation } from '../domain/material-location';

export { isMonth, MONTHS } from '../domain/months';
export type { Month } from '../domain/months';

export { EN_DASH, HYPHEN } from '../domain/pincite';

export { deriveSelections, initialCitationFields } from './citation-fields';
export type { CitationFields } from './citation-fields';

export { assemble } from './citation-input';
export type { CitationInput } from './citation-input';

export { emptyToUndefined } from './empty-to-undefined';

export { buildCitationInput } from './citation-input-builders';

export { initialDisplayState, isNameVariant, MODES } from './display-state';
export type {
	DisplayState,
	Emphasis,
	Mode,
	NameVariant,
	SourceType,
	SpanSeparator,
} from './display-state';

export { selectFieldState } from './field-state';
export type { FieldId, FieldRequirement, Selections } from './field-state';

export { hasStatuteFullFields, resolveShortFormKind } from './source-shape';
export type { SourceShape } from './source-shape';

export { isSourceType, SOURCE_TYPES } from './source-type';

export { HISTORY_PHRASES, isHistoryPhrase } from '../domain/case-history';
export type { HistoryPhrase } from '../domain/case-history';

// CODE_ABBREVIATIONS/COURT_ABBREVIATIONS/REPORTER_ABBREVIATIONS are
// intentionally not re-exported here -- they're large (the underlying
// vendor JSON is megabytes) and only ever needed at build time by
// citation-builder.ui.astro. Re-exporting them from this barrel would pull
// them into the citation-builder client bundle too, since bundlers don't
// tree-shake this module's other computed exports out of a chunk that
// imports anything from it. Import them directly from their own domain
// files instead.
