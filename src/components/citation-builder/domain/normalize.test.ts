import { describe, expect, it } from 'vitest';
import {
	assembleDate,
	normalizeDocketNumber,
	normalizeSection,
} from './normalize';

// r[verify normalize.docket]
describe('normalizeDocketNumber', () => {
	// Rule 10.8.1: §8.4 table, verbatim, plus extra boundary coverage.
	it.each([
		['05-CR-6050 CJS', 'No. 05-CR-6050 CJS'],
		['No. 05-CR-6050 CJS', 'No. 05-CR-6050 CJS'],
		['Case No. 1:20-cv-01234', 'No. 1:20-cv-01234'],
		['Docket No. 21-1234', 'No. 21-1234'],
		['No.05-1234', 'No. 05-1234'],
		['North-123', 'No. North-123'],
		['Norfolk County 44', 'No. Norfolk County 44'],
		['CASE NO. 5', 'No. 5'],
		['no.5', 'No. 5'],
		['NO 5', 'No. 5'],
		['No  5', 'No. 5'],
		['Case No 12', 'No. 12'],
		['', 'No. '],
		['  No. 5', 'No. 5'],
		['  05-CR-6050 CJS  ', 'No. 05-CR-6050 CJS'],
	])('normalizes %j to %j', (input, expected) => {
		expect(normalizeDocketNumber(input)).toBe(expected);
	});
});

// r[verify normalize.section]
describe('normalizeSection', () => {
	// Rule 12: §8.4 table, verbatim.
	it.each([
		['3767.32(A)', '§ 3767.32(A)'],
		['§ 3767.32(A)', '§ 3767.32(A)'],
		['§3767.32(A)', '§ 3767.32(A)'],
		['1983', '§ 1983'],
		['§§ 1983, 1988', '§§ 1983, 1988'],
		['§§1983,1988', '§§ 1983,1988'],
		['§  1983', '§ 1983'],
		['§§  1983, 1988', '§§ 1983, 1988'],
		['  1983  ', '§ 1983'],
		['  § 1983', '§ 1983'],
	])('normalizes %j to %j', (input, expected) => {
		expect(normalizeSection(input)).toBe(expected);
	});
});

// r[verify normalize.date]
describe('assembleDate', () => {
	it.each([
		[{ month: 'Sept.', day: 17, year: 2021 }, 'Sept. 17, 2021'],
		[{ month: 'May', day: 1, year: 2020 }, 'May 1, 2020'],
		[{ month: 'Oct.', day: 21, year: 2005 }, 'Oct. 21, 2005'],
	] as const)('combines %j as %j', (parts, expected) => {
		expect(assembleDate(parts)).toBe(expected);
	});
});
