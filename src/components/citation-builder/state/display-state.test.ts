import { describe, expect, it } from 'vitest';
import { EN_DASH, HYPHEN } from '../domain/pincite';
import {
	isEmphasis,
	isMode,
	isNameVariant,
	isSpanSeparator,
} from './display-state';

describe('isNameVariant', () => {
	it('rejects a value that is not a real name variant', () => {
		expect(isNameVariant('id')).toBe(false);
	});
});

describe('isMode', () => {
	it.each(['full', 'short'] as const)('accepts %s', (value) => {
		expect(isMode(value)).toBe(true);
	});

	it('rejects a value that is not a real mode', () => {
		expect(isMode('medium')).toBe(false);
	});
});

describe('isEmphasis', () => {
	it.each(['italic', 'underline'] as const)('accepts %s', (value) => {
		expect(isEmphasis(value)).toBe(true);
	});

	it('rejects a value that is not a real emphasis', () => {
		expect(isEmphasis('bold')).toBe(false);
	});
});

describe('isSpanSeparator', () => {
	it.each([HYPHEN, EN_DASH])('accepts %s', (value) => {
		expect(isSpanSeparator(value)).toBe(true);
	});

	it('rejects a value that is not a real span separator', () => {
		expect(isSpanSeparator('~')).toBe(false);
	});
});
