// Barrel so the view depends on "the state layer," not five separate files.

export { deriveSelections, initialCitationFields } from './citation-fields';
export type {
	AvailabilityKind,
	CitationFields,
	CodeType,
	MaterialLocationKind,
	SourceType,
} from './citation-fields';

export { assemble } from './citation-input';
export type { CitationInput } from './citation-input';

export { buildCitationInput } from './citation-input-builders';

export { initialDisplayState } from './display-state';
export type {
	DisplayState,
	Emphasis,
	Mode,
	NameVariant,
	SpanSeparator,
} from './display-state';

export { selectFieldState } from './field-state';
export type { FieldId, FieldRequirement, Selections } from './field-state';
