import type { CitationFields } from './citation-fields';
import { deriveSelections, initialCitationFields } from './citation-fields';
import type { DisplayState } from './display-state';
import { selectFieldState } from './field-state';
import type { FieldId } from './field-state';

// Single source for the numeric rule: the form's `pattern` attribute and the
// pure check below both read it, so they cannot drift apart.
export const NUMERIC_PATTERN = '\\d+';
export const NUMERIC_FIELDS: readonly FieldId[] = [
	'year',
	'day',
	'supplementYear',
];

const NUMERIC_REGEX = new RegExp(`^(?:${NUMERIC_PATTERN})$`, 'u');

function isFieldId(key: string): key is FieldId {
	return Object.hasOwn(initialCitationFields(), key);
}

export function missingFields(
	fields: CitationFields,
	display: DisplayState,
): FieldId[] {
	const requirements = selectFieldState(deriveSelections(fields, display));
	return Object.keys(requirements)
		.filter((key) => isFieldId(key))
		.filter((id) => requirements[id] === 'required' && fields[id] === '');
}

function invalidNumericFields(
	fields: CitationFields,
	display: DisplayState,
): FieldId[] {
	const requirements = selectFieldState(deriveSelections(fields, display));
	return NUMERIC_FIELDS.filter(
		(id) =>
			requirements[id] !== 'not-used' &&
			fields[id] !== '' &&
			!NUMERIC_REGEX.test(fields[id]),
	);
}

// What the builder's form validity and the saved-list form picker both ask.
export function isCitationComplete(
	fields: CitationFields,
	display: DisplayState,
): boolean {
	return (
		missingFields(fields, display).length === 0 &&
		invalidNumericFields(fields, display).length === 0
	);
}
