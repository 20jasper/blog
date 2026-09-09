import { reportedCitationInput } from './citation-input-builders-reported';
import { statuteCitationInput } from './citation-input-builders-statute';
import { unreportedCitationInput } from './citation-input-builders-unreported';
import type { CitationFields } from './citation-fields';
import type { CitationInput } from './citation-input';
import type { DisplayState } from './display-state';
import { resolveSourceShape } from './source-shape';

export function buildCitationInput(
	fields: CitationFields,
	display: DisplayState,
): CitationInput {
	const sourceShape = resolveSourceShape(display);
	switch (sourceShape.sourceType) {
		case 'reported':
			return reportedCitationInput(fields, sourceShape);
		case 'unreported':
			return unreportedCitationInput(fields, sourceShape);
		case 'statute':
			return statuteCitationInput(fields, sourceShape);
	}
}
