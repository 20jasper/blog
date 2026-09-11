import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import {
	findSavedCitation,
	loadSavedCitations,
	saveCitation,
	updateSavedCitation,
} from './saved-citations';

const STORAGE_KEY = 'citation-builder:saved-citations:v1';

function fakeLocalStorage(): Storage {
	const store = new Map<string, string>();
	return {
		getItem: (key) => store.get(key) ?? null,
		setItem: (key, value) => {
			store.set(key, value);
		},
		removeItem: (key) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		},
		key: () => null,
		get length() {
			return store.size;
		},
	};
}

beforeEach(() => {
	// oxlint-disable-next-line no-unsafe-type-assertion
	(globalThis as { localStorage: Storage }).localStorage = fakeLocalStorage();
});

afterEach(() => {
	// oxlint-disable-next-line no-unsafe-type-assertion
	delete (globalThis as { localStorage?: Storage }).localStorage;
});

const FIELDS = initialCitationFields();
const DISPLAY = initialDisplayState();

describe('loadSavedCitations', () => {
	it('returns an empty list when nothing has been saved', () => {
		expect(loadSavedCitations()).toEqual([]);
	});

	it('returns an empty list for malformed JSON', () => {
		localStorage.setItem(STORAGE_KEY, '{not json');

		expect(loadSavedCitations()).toEqual([]);
	});

	it('returns an empty list when the stored value is not an array', () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));

		expect(loadSavedCitations()).toEqual([]);
	});

	it('drops a corrupted entry but keeps the valid siblings', () => {
		const first = saveCitation(FIELDS, DISPLAY, 'first');
		const second = saveCitation(FIELDS, DISPLAY, 'second');
		// oxlint-disable-next-line no-unsafe-type-assertion
		const rawList = JSON.parse(
			localStorage.getItem(STORAGE_KEY) ?? '[]',
		) as Record<string, unknown>[];
		const tampered = [
			rawList[0],
			{ ...rawList[1], fields: { ...second.fields, caseType: 'nonsense' } },
		];
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tampered));

		expect(loadSavedCitations()).toEqual([first]);
	});

	it('returns newest first', () => {
		vi.useFakeTimers();
		const first = saveCitation(FIELDS, DISPLAY, 'first');
		vi.advanceTimersByTime(1000);
		const second = saveCitation(FIELDS, DISPLAY, 'second');
		vi.useRealTimers();

		expect(loadSavedCitations()).toEqual([second, first]);
	});
});

describe('saveCitation', () => {
	it('creates a new record with a generated id and timestamp', () => {
		const citation = saveCitation(FIELDS, DISPLAY, 'Dayton v. Stewart');

		expect(citation.id).toBeTruthy();
		expect(citation.savedAt).toBeTruthy();
		expect(loadSavedCitations()).toEqual([citation]);
	});

	it('generates distinct ids across calls', () => {
		const first = saveCitation(FIELDS, DISPLAY, 'first');
		const second = saveCitation(FIELDS, DISPLAY, 'second');

		expect(first.id).not.toBe(second.id);
	});
});

describe('updateSavedCitation', () => {
	it('mutates only the matching id and leaves others untouched', () => {
		const first = saveCitation(FIELDS, DISPLAY, 'first');
		const second = saveCitation(FIELDS, DISPLAY, 'second');

		const updated = updateSavedCitation(
			second.id,
			{ ...FIELDS, party1: 'Changed' },
			DISPLAY,
			'updated label',
		);

		expect(updated?.label).toBe('updated label');
		expect(updated?.fields.party1).toBe('Changed');
		expect(loadSavedCitations()).toHaveLength(2);
		expect(findSavedCitation(first.id)).toEqual(first);
	});

	it('returns undefined for an unknown id', () => {
		expect(
			updateSavedCitation('missing', FIELDS, DISPLAY, 'label'),
		).toBeUndefined();
	});

	it('returns undefined when the matching stored entry is corrupted', () => {
		const citation = saveCitation(FIELDS, DISPLAY, 'first');
		// oxlint-disable-next-line no-unsafe-type-assertion
		const rawList = JSON.parse(
			localStorage.getItem(STORAGE_KEY) ?? '[]',
		) as Record<string, unknown>[];
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify([{ ...rawList[0], fields: 'not an object' }]),
		);

		expect(
			updateSavedCitation(citation.id, FIELDS, DISPLAY, 'label'),
		).toBeUndefined();
	});
});

describe('findSavedCitation', () => {
	it('finds a saved citation by id', () => {
		const citation = saveCitation(FIELDS, DISPLAY, 'first');

		expect(findSavedCitation(citation.id)).toEqual(citation);
	});

	it('returns undefined for an unknown id', () => {
		expect(findSavedCitation('missing')).toBeUndefined();
	});
});
