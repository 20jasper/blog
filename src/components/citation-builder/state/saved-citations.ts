import * as z from 'zod/mini';
import type { CitationFields } from './citation-fields';
import { citationFieldsSchema, displayStateSchema } from './citation-schemas';
import type { DisplayState } from './display-state';

const STORAGE_KEY = 'citation-builder:saved-citations:v1';

const savedCitationSchema = z.object({
	id: z.string(),
	savedAt: z.string(),
	label: z.string(),
	fields: citationFieldsSchema,
	display: displayStateSchema,
});

export type SavedCitation = {
	id: string;
	savedAt: string;
	label: string;
	fields: CitationFields;
	display: DisplayState;
};

function readRawList(): unknown[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) {
			return [];
		}
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function writeRawList(list: unknown[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	} catch {
		// storage full or blocked (private mode) — persistence is best-effort
	}
}

function hasId(entry: unknown, id: string): boolean {
	return (
		typeof entry === 'object' &&
		entry !== null &&
		'id' in entry &&
		entry.id === id
	);
}

// A single corrupted entry (e.g. from a future schema change) must not
// erase the rest of the user's saved list, unlike the single-slot autosave.
export function loadSavedCitations(): SavedCitation[] {
	return readRawList()
		.map((entry) => savedCitationSchema.safeParse(entry))
		.filter((result) => result.success)
		.map((result) => result.data)
		.toSorted((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function findSavedCitation(id: string): SavedCitation | undefined {
	return loadSavedCitations().find((citation) => citation.id === id);
}

export function saveCitation(
	fields: CitationFields,
	display: DisplayState,
	label: string,
): SavedCitation {
	const citation: SavedCitation = {
		id: crypto.randomUUID(),
		savedAt: new Date().toISOString(),
		label,
		fields,
		display,
	};
	writeRawList([...readRawList(), citation]);
	return citation;
}

export function updateSavedCitation(
	id: string,
	fields: CitationFields,
	display: DisplayState,
	label: string,
): SavedCitation | undefined {
	const rawList = readRawList();
	const index = rawList.findIndex((entry) => hasId(entry, id));
	if (index === -1) {
		return undefined;
	}
	const parsed = savedCitationSchema.safeParse(rawList[index]);
	if (!parsed.success) {
		return undefined;
	}
	const updated: SavedCitation = {
		...parsed.data,
		fields,
		display,
		label,
	};
	writeRawList(rawList.with(index, updated));
	return updated;
}
