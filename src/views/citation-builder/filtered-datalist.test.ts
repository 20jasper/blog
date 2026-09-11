import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce, filterOptions, parseOptions } from './filtered-datalist';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('does not call the function before the delay elapses', () => {
		const fn = vi.fn<() => void>();
		const debounced = debounce(fn, 100);

		debounced();
		vi.advanceTimersByTime(99);

		expect(fn).not.toHaveBeenCalled();
	});

	it('calls the function once the delay elapses', () => {
		const fn = vi.fn<() => void>();
		const debounced = debounce(fn, 100);

		debounced();
		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledOnce();
	});

	it('resets the delay on repeated calls, collapsing them into one', () => {
		const fn = vi.fn<() => void>();
		const debounced = debounce(fn, 100);

		debounced();
		vi.advanceTimersByTime(60);
		debounced();
		vi.advanceTimersByTime(60);
		debounced();
		vi.advanceTimersByTime(99);

		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);

		expect(fn).toHaveBeenCalledOnce();
	});
});

describe('filterOptions', () => {
	const options = [
		{ value: 'N.E.3d', text: 'North Eastern Reporter, Third Series' },
		{ value: 'N.E.2d', text: 'North Eastern Reporter, Second Series' },
		{ value: 'F.3d', text: 'Federal Reporter, Third Series' },
	];

	it('returns nothing for an empty query', () => {
		expect(filterOptions(options, '', 25)).toEqual([]);
		expect(filterOptions(options, '   ', 25)).toEqual([]);
	});

	it('matches case-insensitively against value or text', () => {
		expect(filterOptions(options, 'n.e', 25)).toHaveLength(2);
		expect(filterOptions(options, 'federal', 25)).toEqual([options[2]]);
	});

	it('caps results at maxResults', () => {
		expect(filterOptions(options, 'reporter', 2)).toHaveLength(2);
	});
});

describe('parseOptions', () => {
	it('parses a valid options array', () => {
		const json = JSON.stringify([{ value: 'N.E.3d', text: 'North Eastern' }]);
		expect(parseOptions(json)).toEqual([
			{ value: 'N.E.3d', text: 'North Eastern' },
		]);
	});

	it('returns an empty array for malformed or mismatched data', () => {
		expect(parseOptions('[{"value":"N.E.3d"}]')).toEqual([]);
		expect(parseOptions('{"not":"an array"}')).toEqual([]);
	});
});
