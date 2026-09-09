// Barrel so the view depends on "the state layer," not five separate files.

export { deriveSelections, initialCitationFields } from './citation-fields';
export type { CitationFields } from './citation-fields';

export { assemble } from './citation-input';
export type { CitationInput } from './citation-input';

export { emptyToUndefined } from './empty-to-undefined';

export { buildCitationInput } from './citation-input-builders';

export { initialDisplayState } from './display-state';
export type {
	DisplayState,
	Emphasis,
	Mode,
	NameVariant,
	SourceType,
	SpanSeparator,
} from './display-state';

export { isSourceType } from './source-type';

export { selectFieldState } from './field-state';
export type { FieldId, FieldRequirement, Selections } from './field-state';
