import { describe, expect, it } from 'vitest';
import { assembleUnreportedCase, type UnreportedCaseInput } from './assemble';
import { render } from './render';

type SlipInput = Extract<UnreportedCaseInput, { availability: 'slip' }>;
type DatabaseInput = Extract<UnreportedCaseInput, { availability: 'database' }>;

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
