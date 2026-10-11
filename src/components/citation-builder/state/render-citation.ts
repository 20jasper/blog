import { render } from '../domain/render';
import type { CitationFields } from './citation-fields';
import { assemble } from './citation-input';
import { buildCitationInput } from './citation-input-builders';
import type { DisplayState } from './display-state';

// Fields plus display settings in, copyable html and plain text out. Shared by
// the builder and the saved list so both render a citation the same way.
export function renderCitation(
	fields: CitationFields,
	display: DisplayState,
): { html: string; plain: string } {
	const segments = assemble(buildCitationInput(fields, display), {
		spanSeparator: display.spanSeparator,
		signal: display.signal,
	});
	return render(segments, { emphasis: display.emphasis });
}
