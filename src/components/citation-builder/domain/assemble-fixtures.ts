import type { ReportedCaseInput } from './assemble';

export function reportedCase(
	overrides: Partial<ReportedCaseInput> = {},
): ReportedCaseInput {
	return {
		name: { caseType: 'v', party1: 'Dayton', party2: 'Stewart' },
		volume: '179',
		reporter: 'N.E.3d',
		firstPage: '208',
		pincite: '214',
		court: 'Ohio Ct. App.',
		year: 2021,
		...overrides,
	};
}
