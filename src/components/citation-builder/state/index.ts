// Public surface of the state layer for external consumers (the view).
// Internal modules here still import each other directly -- this barrel
// exists so a consumer like the view depends on "the state layer" as one
// unit instead of reaching into five separate files.

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
