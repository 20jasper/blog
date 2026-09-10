import { describe, expect, it } from 'vitest';
import { assert, property, string } from 'fast-check';
import { abbreviatePartyName } from './party-name-abbreviations';

// r[verify case-name.word-abbreviation]
describe('abbreviatePartyName', () => {
	it.each([
		['Microsoft Corporation', 'Microsoft Corp.'],
		['National Association', "Nat'l Ass'n"],
		['Smith Brothers, Inc.', 'Smith Bros., Inc.'],
		['Dayton', 'Dayton'],
		['CORPORATION', 'Corp.'],
		['Corporation Smith', 'Corp. Smith'],
		['Incorporation', 'Incorporation'],
	])('%s -> %s', (raw, expected) => {
		expect(abbreviatePartyName(raw)).toBe(expected);
	});

	// r[verify case-name.plural-abbreviation]
	it.each([
		['Corporations', 'Corps.'],
		['National Associations', "Nat'l Ass'ns"],
		['Departments', "Dep'ts"],
		['Universities', 'Univs.'],
		['Corporations,', 'Corps.,'],
	])('%s -> %s', (raw, expected) => {
		expect(abbreviatePartyName(raw)).toBe(expected);
	});

	it('is idempotent for any string', () => {
		assert(
			property(string(), (name) => {
				const once = abbreviatePartyName(name);
				expect(abbreviatePartyName(once)).toBe(once);
			}),
		);
	});
});
