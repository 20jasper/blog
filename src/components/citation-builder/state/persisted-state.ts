import { nullable, object, parse, string } from 'valibot';
import type { CitationFields } from './citation-fields';
import { citationFieldsSchema, displayStateSchema } from './citation-schemas';
import type { DisplayState } from './display-state';

const STORAGE_KEY = 'citation-builder:v1';

const persistedStateSchema = object({
	fields: citationFieldsSchema,
	display: displayStateSchema,
	citationId: nullable(string()),
});

export type PersistedState = {
	fields: CitationFields;
	display: DisplayState;
	citationId: string | null;
};

export function savePersistedState(
	fields: CitationFields,
	display: DisplayState,
	citationId: string | null,
) {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				fields,
				display,
				citationId,
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
