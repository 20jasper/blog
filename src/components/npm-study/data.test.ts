import { describe, expect, it } from 'vitest';
import { formatCount, formatThresholdHours } from './data';

describe('formatThresholdHours', () => {
	it('uses hours below 72 and whole days from 72', () => {
		expect(formatThresholdHours(71)).toBe('71h');
		expect(formatThresholdHours(72)).toBe('3d');
		expect(formatThresholdHours(720)).toBe('30d');
	});
});

describe('formatCount', () => {
	it('keeps small counts whole', () => {
		expect(formatCount(999)).toBe('999');
	});

	it('abbreviates thousands and drops a trailing .0', () => {
		expect(formatCount(1000)).toBe('1k');
		expect(formatCount(1500)).toBe('1.5k');
		expect(formatCount(100_000)).toBe('100k');
	});
});
