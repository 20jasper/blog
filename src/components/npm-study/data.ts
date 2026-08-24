export type ThresholdPoint = {
	hours: number;
	percentRemoved: number;
	count: number;
};

// Every threshold point in the yank data lands on this hours/days boundary --
// below 3 days reads better as hours, at or above as whole days.
export function formatThresholdHours(hours: number) {
	return hours >= 72 ? `${hours / 24}d` : `${hours}h`;
}

export const YANK_DATA: ThresholdPoint[] = [
	{ hours: 1, percentRemoved: 16.3, count: 2391 },
	{ hours: 2, percentRemoved: 21.0, count: 3077 },
	{ hours: 3, percentRemoved: 24.9, count: 3642 },
	{ hours: 6, percentRemoved: 30.3, count: 4436 },
	{ hours: 9, percentRemoved: 37.1, count: 5423 },
	{ hours: 12, percentRemoved: 40.4, count: 5910 },
	{ hours: 18, percentRemoved: 47.2, count: 6904 },
	{ hours: 24, percentRemoved: 52.8, count: 7724 },
	{ hours: 36, percentRemoved: 58.6, count: 8571 },
	{ hours: 48, percentRemoved: 63.8, count: 9331 },
	{ hours: 60, percentRemoved: 66.5, count: 9724 },
	{ hours: 72, percentRemoved: 68.7, count: 10057 },
	{ hours: 96, percentRemoved: 69.6, count: 10182 },
	{ hours: 120, percentRemoved: 70.3, count: 10290 },
	{ hours: 144, percentRemoved: 70.7, count: 10347 },
	{ hours: 168, percentRemoved: 71.0, count: 10391 },
	{ hours: 192, percentRemoved: 71.6, count: 10479 },
	{ hours: 216, percentRemoved: 72.1, count: 10546 },
	{ hours: 240, percentRemoved: 72.8, count: 10652 },
	{ hours: 264, percentRemoved: 73.0, count: 10673 },
	{ hours: 288, percentRemoved: 73.2, count: 10702 },
	{ hours: 312, percentRemoved: 73.3, count: 10723 },
	{ hours: 336, percentRemoved: 73.4, count: 10741 },
	{ hours: 384, percentRemoved: 73.8, count: 10799 },
	{ hours: 432, percentRemoved: 74.0, count: 10819 },
	{ hours: 480, percentRemoved: 74.2, count: 10850 },
	{ hours: 528, percentRemoved: 74.3, count: 10870 },
	{ hours: 576, percentRemoved: 74.4, count: 10884 },
	{ hours: 624, percentRemoved: 74.6, count: 10908 },
	{ hours: 672, percentRemoved: 74.7, count: 10929 },
	{ hours: 720, percentRemoved: 74.8, count: 10948 },
];
export const YANK_N = 14629;

export type MonthlyVolumePoint = {
	m: string;
	tea: number;
	backfill: number;
	other: number;
};

const MONTHLY_VOLUME: MonthlyVolumePoint[] = [
	{ m: '2021-11', tea: 0, backfill: 0, other: 1 },
	{ m: '2021-12', tea: 0, backfill: 0, other: 4 },
	{ m: '2022-01', tea: 0, backfill: 0, other: 1 },
	{ m: '2022-05', tea: 0, backfill: 0, other: 196 },
	{ m: '2022-06', tea: 0, backfill: 0, other: 4943 },
	{ m: '2022-07', tea: 0, backfill: 0, other: 814 },
	{ m: '2022-08', tea: 0, backfill: 0, other: 1079 },
	{ m: '2022-09', tea: 0, backfill: 0, other: 176 },
	{ m: '2022-10', tea: 0, backfill: 0, other: 99 },
	{ m: '2022-11', tea: 0, backfill: 0, other: 52 },
	{ m: '2022-12', tea: 0, backfill: 0, other: 64 },
	{ m: '2023-01', tea: 0, backfill: 0, other: 219 },
	{ m: '2023-02', tea: 0, backfill: 0, other: 133 },
	{ m: '2023-03', tea: 0, backfill: 0, other: 111 },
	{ m: '2023-04', tea: 0, backfill: 0, other: 135 },
	{ m: '2023-05', tea: 0, backfill: 0, other: 319 },
	{ m: '2023-06', tea: 0, backfill: 0, other: 182 },
	{ m: '2023-07', tea: 0, backfill: 0, other: 245 },
	{ m: '2023-08', tea: 0, backfill: 0, other: 271 },
	{ m: '2023-09', tea: 0, backfill: 0, other: 233 },
	{ m: '2023-10', tea: 0, backfill: 0, other: 118 },
	{ m: '2023-11', tea: 0, backfill: 0, other: 203 },
	{ m: '2023-12', tea: 0, backfill: 0, other: 122 },
	{ m: '2024-01', tea: 0, backfill: 0, other: 954 },
	{ m: '2024-02', tea: 0, backfill: 0, other: 92 },
	{ m: '2024-03', tea: 0, backfill: 0, other: 117 },
	{ m: '2024-04', tea: 0, backfill: 0, other: 134 },
	{ m: '2024-05', tea: 0, backfill: 0, other: 80 },
	{ m: '2024-06', tea: 0, backfill: 0, other: 2617 },
	{ m: '2024-07', tea: 0, backfill: 0, other: 785 },
	{ m: '2024-08', tea: 0, backfill: 0, other: 214 },
	{ m: '2024-09', tea: 0, backfill: 0, other: 953 },
	{ m: '2024-10', tea: 0, backfill: 0, other: 932 },
	{ m: '2024-11', tea: 0, backfill: 0, other: 716 },
	{ m: '2024-12', tea: 0, backfill: 0, other: 778 },
	{ m: '2025-01', tea: 0, backfill: 0, other: 743 },
	{ m: '2025-02', tea: 0, backfill: 0, other: 775 },
	{ m: '2025-03', tea: 0, backfill: 0, other: 1195 },
	{ m: '2025-04', tea: 0, backfill: 0, other: 478 },
	{ m: '2025-05', tea: 0, backfill: 0, other: 970 },
	{ m: '2025-06', tea: 0, backfill: 0, other: 801 },
	{ m: '2025-07', tea: 0, backfill: 0, other: 1031 },
	{ m: '2025-08', tea: 0, backfill: 34119, other: 1085 },
	{ m: '2025-09', tea: 0, backfill: 0, other: 5579 },
	{ m: '2025-10', tea: 0, backfill: 0, other: 1414 },
	{ m: '2025-11', tea: 140728, backfill: 0, other: 1435 },
	{ m: '2025-12', tea: 0, backfill: 0, other: 1067 },
	{ m: '2026-01', tea: 0, backfill: 0, other: 527 },
	{ m: '2026-02', tea: 0, backfill: 0, other: 329 },
	{ m: '2026-03', tea: 0, backfill: 0, other: 1048 },
	{ m: '2026-04', tea: 0, backfill: 0, other: 619 },
	{ m: '2026-05', tea: 0, backfill: 0, other: 1629 },
	{ m: '2026-06', tea: 0, backfill: 0, other: 1431 },
	{ m: '2026-07', tea: 0, backfill: 0, other: 2060 },
	{ m: '2026-08', tea: 0, backfill: 0, other: 2781 },
];

// Pre Jan 2022 is backfilled and unrepresentative low
const MONTHLY_DETECTIONS_DATA = MONTHLY_VOLUME.filter((d) => d.m >= '2022-02');

export type ThresholdChart = {
	id: string;
	title: string;
	alt: string;
	data: ThresholdPoint[];
	total: number;
	tooltipVerb: string;
	unitNoun: string;
	xColumnLabel: string;
	yColumnLabel: string;
	valueColumnLabel: string;
	refLines: { hours: number; label: string }[];
};

export const PUBLISH_TO_YANK_CHART: ThresholdChart = {
	id: 'chart-yank',
	title: 'Cumulative malicious npm version removal by age',
	alt: `Based on ${YANK_N.toLocaleString()} OSV supply chain advisories from the last 5 years affecting a single npm version, combined with npm registry data for each version's publish and unpublish time`,
	data: YANK_DATA,
	total: YANK_N,
	tooltipVerb: 'removed by',
	unitNoun: 'packages',
	xColumnLabel: 'time since publish',
	yColumnLabel: 'packages removed',
	valueColumnLabel: '% removed',
	// log(0) is undefined, so ref line pinned to the axis's left edge instead
	refLines: [
		{ hours: 0, label: 'npm/Yarn/Bun default' },
		{ hours: 24, label: 'pnpm 11/Deno 2.9/aube 1.29.0 default' },
		{ hours: 72, label: 'Renovate config:best-practices' },
	],
};

export type MonthlyDetectionsChart = {
	id: string;
	title: string;
	caption: string;
	rows: MonthlyVolumePoint[];
};

export const MONTHLY_DETECTIONS_CHART: MonthlyDetectionsChart = {
	id: 'chart-monthly-detections',
	title: 'Monthly npm package supply chain attack detections',
	caption: `Excludes the tea.xyz reward-farming campaign, with 140,728 records in November 2025 alone. Based on OSV supply chain advisories from the last 5 years`,
	rows: MONTHLY_DETECTIONS_DATA,
};
