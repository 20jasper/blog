import { array, object, safeParse, string, unknown } from 'valibot';
import type { CitationFields } from './citation-fields';
import { citationFieldsSchema, displayStateSchema } from './citation-schemas';
import type { DisplayState } from './display-state';

const STORAGE_KEY = 'citation-builder:saved-citations:v1';

const rawListSchema = array(unknown());

const savedCitationSchema = object({
	id: string(),
	savedAt: string(),
	label: string(),
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
		const result = safeParse(rawListSchema, JSON.parse(raw));
		return result.success ? result.output : [];
	} catch (error) {
		console.warn('Discarding corrupted saved-citations list:', error);
		return [];
	}
}

function writeRawList(list: unknown[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	} catch {
		// storage full or blocked (private mode)
	}
}

const entryIdSchema = object({ id: string() });

function hasId(entry: unknown, id: string): boolean {
	const result = safeParse(entryIdSchema, entry);
	return result.success && result.output.id === id;
}

// A single corrupted entry (e.g. from a future schema change) must not
// erase the rest of the user's saved list, unlike the single-slot autosave.
export function loadSavedCitations(): SavedCitation[] {
	const results = readRawList().map((entry) =>
		safeParse(savedCitationSchema, entry),
	);
	const dropped = results.filter((result) => !result.success).length;
	if (dropped > 0) {
		console.warn(`Discarding ${dropped} corrupted saved citation(s)`);
	}
	return results
		.filter((result) => result.success)
		.map((result) => result.output)
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
	const parsed = safeParse(savedCitationSchema, rawList[index]);
	if (!parsed.success) {
		console.warn(`Discarding corrupted saved citation ${id}:`, parsed.issues);
		return undefined;
	}
	const updated: SavedCitation = {
		...parsed.output,
		fields,
		display,
		label,
	};
	writeRawList(rawList.with(index, updated));
	return updated;
}

export function deleteSavedCitation(id: string): void {
	writeRawList(readRawList().filter((entry) => !hasId(entry, id)));
}
