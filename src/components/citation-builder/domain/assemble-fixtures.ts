import type {
	ReportedCaseInput,
	StatuteInput,
	UnreportedCaseInput,
} from './assemble';

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

export function unreportedCase(
	overrides: Partial<UnreportedCaseInput> = {},
): UnreportedCaseInput {
	return {
		name: { caseType: 'v', party1: 'State', party2: 'Lucko' },
		docket: '2021CA0007',
		availability: { kind: 'database', databaseId: '2021 WL 4269952' },
		court: 'Ohio Ct. App.',
		date: { month: 'Sept.', day: 17, year: 2021 },
		...overrides,
	};
}

type AnnotatedStatute = Extract<StatuteInput, { codeType: 'annotated' }>;
type OfficialStatute = Extract<StatuteInput, { codeType: 'official' }>;

export function annotatedStatute(
	overrides: Partial<AnnotatedStatute> = {},
): StatuteInput {
	return {
		codeType: 'annotated',
		codeAbbreviation: 'Ohio Rev. Code Ann.',
		section: '3767.32(A)',
		publisher: 'West',
		year: 2025,
		supplement: undefined,
		...overrides,
	};
}

export function officialStatute(
	overrides: Partial<OfficialStatute> = {},
): StatuteInput {
	return {
		codeType: 'official',
		codeAbbreviation: 'Ohio Rev. Code',
		section: '3767.32(A)',
		year: 2025,
		...overrides,
	};
}
