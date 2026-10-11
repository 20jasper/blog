import { nullable, object, optional, parse, string } from 'valibot';
import type { CitationFields } from './citation-fields';
import { citationFieldsSchema, displayStateSchema } from './citation-schemas';
import type { DisplayState } from './display-state';

const STORAGE_KEY = 'citation-builder:v1';

const persistedStateSchema = object({
	fields: citationFieldsSchema,
	display: displayStateSchema,
	citationId: nullable(string()),
	// Drafts saved before notes existed have no notes.
	notes: optional(string(), ''),
});

export type PersistedState = {
	fields: CitationFields;
	display: DisplayState;
	citationId: string | null;
	notes: string;
};

export function savePersistedState(
	fields: CitationFields,
	display: DisplayState,
	citationId: string | null,
	notes = '',
) {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				fields,
				display,
				citationId,
				notes,
			} satisfies PersistedState),
		);
	} catch {
		// storage full or blocked (private mode)
	}
}

export function loadPersistedState(): PersistedState | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) {
			return null;
		}
		return parse(persistedStateSchema, JSON.parse(raw));
	} catch (error) {
		console.warn('Discarding corrupted citation-builder draft:', error);
		return null;
	}
}
