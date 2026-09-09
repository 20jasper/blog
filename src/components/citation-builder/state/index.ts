// Barrel so the view depends on "the state layer," not five separate files.

export { isAvailability } from '../domain/availability';
export type { Availability } from '../domain/availability';

export { isCaseTypeId } from '../domain/case-types';
export type { CaseTypeId } from '../domain/case-types';

export { isCodeType } from '../domain/code-type';
export type { CodeType } from '../domain/code-type';

export { isMaterialLocation } from '../domain/material-location';
export type { MaterialLocation } from '../domain/material-location';

export { isMonth } from '../domain/months';
export type { Month } from '../domain/months';

export { EN_DASH, HYPHEN } from '../domain/pincite';

export { deriveSelections, initialCitationFields } from './citation-fields';
export type { CitationFields } from './citation-fields';

export { assemble } from './citation-input';
export type { CitationInput } from './citation-input';

export { emptyToUndefined } from './empty-to-undefined';

export { buildCitationInput } from './citation-input-builders';

export { initialDisplayState, isNameVariant } from './display-state';
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

export { isSourceType } from './source-type';
