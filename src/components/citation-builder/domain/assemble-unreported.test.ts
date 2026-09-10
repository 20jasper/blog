import { describe, expect, it } from 'vitest';
import { assembleUnreportedCase, type UnreportedCaseInput } from './assemble';
import { render } from './render';

type SlipInput = Extract<UnreportedCaseInput, { availability: 'slip' }>;
type DatabaseInput = Extract<UnreportedCaseInput, { availability: 'database' }>;
type OnlineInput = Extract<UnreportedCaseInput, { availability: 'online' }>;

function slipCase(overrides: Partial<SlipInput> = {}): SlipInput {
	return {
		name: { caseType: 'v', party1: 'Chatlas', party2: 'Allstate Ins. Co.' },
		docket: '1-07-2937',
		availability: 'slip',
		pincite: '2',
		court: 'Ill. App. Ct. 1st Dist.',
		month: 'June',
		day: 30,
		year: 2008,
		...overrides,
	};
}

function databaseCase(overrides: Partial<DatabaseInput> = {}): DatabaseInput {
	return {
		name: { caseType: 'v', party1: 'Beaven', party2: 'U.S. Dep’t of Justice' },
		docket: '03-84-JBC',
		availability: 'database',
		databaseId: '2007 WL 1032301',
		pincite: '3',
		court: 'E.D. Ky.',
		month: 'Mar.',
		day: 30,
		year: 2007,
		...overrides,
	};
}

// r[verify citation.unreported-long-form]
// r[verify citation.unreported-pincite-form]
describe('assembleUnreportedCase: golden slip-opinion case', () => {
	it('matches the domain-spec.md Unreported Long Form worked example', () => {
		const { plain } = render(assembleUnreportedCase(slipCase()), {
			emphasis: 'italic',
		});

		expect(plain).toBe(
			'Chatlas v. Allstate Ins. Co., No. 1-07-2937, slip op. at 2 (Ill. App. Ct. 1st Dist. June 30, 2008).',
		);
	});
});

describe('assembleUnreportedCase: database availability', () => {
	it('inserts the database identifier and star-pages the pincite', () => {
		const { plain } = render(assembleUnreportedCase(databaseCase()), {
			emphasis: 'italic',
		});

		expect(plain).toBe(
			'Beaven v. U.S. Dep’t of Justice, No. 03-84-JBC, 2007 WL 1032301, at *3 (E.D. Ky. Mar. 30, 2007).',
		);
	});

	it('omits the pincite segment entirely when absent', () => {
		const { plain } = render(
			assembleUnreportedCase(databaseCase({ pincite: undefined })),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Beaven v. U.S. Dep’t of Justice, No. 03-84-JBC, 2007 WL 1032301 (E.D. Ky. Mar. 30, 2007).',
		);
	});
});

describe('assembleUnreportedCase: slip availability', () => {
	it('omits the pincite segment entirely when absent, dropping "slip op." too', () => {
		const { plain } = render(
			assembleUnreportedCase(slipCase({ pincite: undefined })),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Chatlas v. Allstate Ins. Co., No. 1-07-2937 (Ill. App. Ct. 1st Dist. June 30, 2008).',
		);
	});
});

function onlineCase(overrides: Partial<OnlineInput> = {}): OnlineInput {
	return {
		name: {
			caseType: 'v',
			party1: "Macy's Inc.",
			party2: 'Martha Stewart Living Omnimedia, Inc.',
		},
		docket: '1728',
		availability: 'online',
		url: 'http://www.nycourts.gov/reporter/3dseries/2015/2015_01728.htm',
		pincite: '1',
		court: 'N.Y. App. Div.',
		month: 'Feb.',
		day: 26,
		year: 2015,
		...overrides,
	};
}

// r[verify unreported.online-only]
describe('assembleUnreportedCase: online-only availability', () => {
	it('matches the domain-spec.md Online-Only Availability worked example', () => {
		const { plain } = render(assembleUnreportedCase(onlineCase()), {
			emphasis: 'italic',
		});

		expect(plain).toBe(
			"Macy's Inc. v. Martha Stewart Living Omnimedia, Inc., No. 1728, slip op. at 1 (N.Y. App. Div. Feb. 26, 2015), http://www.nycourts.gov/reporter/3dseries/2015/2015_01728.htm.",
		);
	});

	it('omits the pincite segment entirely when absent, but keeps the URL', () => {
		const { plain } = render(
			assembleUnreportedCase(onlineCase({ pincite: undefined })),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			"Macy's Inc. v. Martha Stewart Living Omnimedia, Inc., No. 1728 (N.Y. App. Div. Feb. 26, 2015), http://www.nycourts.gov/reporter/3dseries/2015/2015_01728.htm.",
		);
	});
});

// r[verify weight-of-authority.parenthetical]
describe('assembleUnreportedCase: weight of authority parenthetical', () => {
	it('appends after the date parenthetical', () => {
		const { plain } = render(
			assembleUnreportedCase(slipCase({ weightOfAuthority: 'per curiam' })),
			{ emphasis: 'italic' },
		);

		expect(plain).toBe(
			'Chatlas v. Allstate Ins. Co., No. 1-07-2937, slip op. at 2 (Ill. App. Ct. 1st Dist. June 30, 2008) (per curiam).',
		);
	});
});

// r[verify normalize.docket]
describe('assembleUnreportedCase: docket normalization', () => {
	it('does not double the "No." prefix if the user already typed one', () => {
		const { plain } = render(
			assembleUnreportedCase(slipCase({ docket: 'No. 1-07-2937' })),
			{ emphasis: 'italic' },
		);

		expect(plain).toContain('No. 1-07-2937');
	});
});
