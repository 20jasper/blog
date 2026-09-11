import * as z from 'zod/mini';
import type { CitationFields } from './citation-fields';
import { citationFieldsSchema, displayStateSchema } from './citation-schemas';
import type { DisplayState } from './display-state';

const STORAGE_KEY = 'citation-builder:v1';

const persistedStateSchema = z.object({
	fields: citationFieldsSchema,
	display: displayStateSchema,
	citationId: z.nullable(z.string()),
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
		// storage full or blocked (private mode) — persistence is best-effort
	}
}

export function loadPersistedState(): PersistedState | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) {
			return null;
		}
		const result = persistedStateSchema.safeParse(JSON.parse(raw));
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}
