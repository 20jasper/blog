import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import { loadPersistedState, savePersistedState } from './persisted-state';

const STORAGE_KEY = 'citation-builder:v1';

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

describe('loadPersistedState', () => {
	it('returns null when nothing has been saved', () => {
		expect(loadPersistedState()).toBeNull();
	});

	it('round-trips a saved fields/display/citationId triple', () => {
		const fields = { ...initialCitationFields(), party1: 'Beaven' };
		const display = { ...initialDisplayState(), signal: 'see' } as const;

		savePersistedState(fields, display, 'citation-1');

		expect(loadPersistedState()).toEqual({
			fields,
			display,
			citationId: 'citation-1',
		});
	});

	it('round-trips a null citationId', () => {
		const fields = initialCitationFields();
		const display = initialDisplayState();

		savePersistedState(fields, display, null);

		expect(loadPersistedState()?.citationId).toBeNull();
	});

	it('returns null for malformed JSON', () => {
		localStorage.setItem(STORAGE_KEY, '{not json');

		expect(loadPersistedState()).toBeNull();
	});

	it('returns null when a field has been tampered with an invalid value', () => {
		const fields = initialCitationFields();
		const display = initialDisplayState();
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				fields: { ...fields, caseType: 'not-a-case-type' },
				display,
			}),
		);

		expect(loadPersistedState()).toBeNull();
	});

	it('returns null when the display state is missing a required field', () => {
		const fields = initialCitationFields();
		const { signal: _signal, ...displayWithoutSignal } = initialDisplayState();
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ fields, display: displayWithoutSignal }),
		);

		expect(loadPersistedState()).toBeNull();
	});
});
