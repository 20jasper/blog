import { describe, expect, it } from 'vitest';
import { assembleUnreportedCase } from './assemble';
import { unreportedCase } from './assemble-fixtures';
import { render } from './render';

const BENNETT = unreportedCase({
	name: { caseType: 'v', party1: 'United States', party2: 'Bennett' },
	docket: '05-CR-6050 CJS',
	availability: { kind: 'database', databaseId: '2005 WL 2709572' },
	court: 'W.D.N.Y.',
	date: { month: 'Oct.', day: 21, year: 2005 },
});

// r[verify citation.unreported-long-form]
describe('assembleUnreportedCase', () => {
	it('matches the Lucko golden case (database, with pincite)', () => {
		const { plain } = render(
			assembleUnreportedCase(unreportedCase({ pincite: '1–2' })),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'State v. Lucko, No. 2021CA0007, 2021 WL 4269952, at *1–2 (Ohio Ct. App. Sept. 17, 2021).',
		);
	});

	it('matches the Bennett golden case (database, no pincite)', () => {
		const { plain } = render(assembleUnreportedCase(BENNETT), {
			emphasis: 'italic',
		});

		expect(plain).toBe(
			'United States v. Bennett, No. 05-CR-6050 CJS, 2005 WL 2709572 (W.D.N.Y. Oct. 21, 2005).',
		);
	});

	it('matches the Bennett slip-opinion variant, per Rule 10.8.1(b): drops the database ID (no pincite in this example either way)', () => {
		const { plain } = render(
			assembleUnreportedCase({
				...BENNETT,
				availability: { kind: 'slip-opinion' },
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'United States v. Bennett, No. 05-CR-6050 CJS (W.D.N.Y. Oct. 21, 2005).',
		);
	});

	it('normalizes the docket number through the same rule as §4.1', () => {
		const { plain } = render(
			assembleUnreportedCase(unreportedCase({ docket: 'Case No. 2021CA0007' })),
			{ emphasis: 'italic' },
		);

		expect(plain).toContain(', No. 2021CA0007,');
	});
});

// The Chatlas pair (r[citation.unreported-pincite-form]) is the one that
// actually proves the two variants differ in pincite *form*, not just
// database-ID presence -- unlike Bennett above, this case has a pincite
// in both variants, so the star-page vs. "slip op. at" split is visible.
// r[verify citation.unreported-pincite-form]
describe('assembleUnreportedCase: pincite form split by Availability', () => {
	const CHATLAS = unreportedCase({
		name: { caseType: 'v', party1: 'Chatlas', party2: 'Allstate Ins. Co.' },
		docket: '1-07-2937',
		availability: { kind: 'database', databaseId: '2008 WL 2610471' },
		court: 'Ill. App. Ct. 1st Dist.',
		date: { month: 'June', day: 30, year: 2008 },
	});

	it('database: at *[Pincite]', () => {
		const { plain } = render(
			assembleUnreportedCase({ ...CHATLAS, pincite: '2' }),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Chatlas v. Allstate Ins. Co., No. 1-07-2937, 2008 WL 2610471, at *2 (Ill. App. Ct. 1st Dist. June 30, 2008).',
		);
	});

	it('slip opinion: slip op. at [Pincite], never a star', () => {
		const { plain } = render(
			assembleUnreportedCase({
				...CHATLAS,
				availability: { kind: 'slip-opinion' },
				pincite: '2',
			}),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Chatlas v. Allstate Ins. Co., No. 1-07-2937, slip op. at 2 (Ill. App. Ct. 1st Dist. June 30, 2008).',
		);
	});
});
