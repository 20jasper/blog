import {
	array,
	number,
	object,
	string,
	type GenericSchema,
	type InferOutput,
} from 'valibot';
import type { ThresholdPoint } from './data';
import type { RefLine } from './ref-lines';

// The contract between each chart's .astro frontmatter (which serializes this
// into a data attribute) and its client script (which parses it back). The
// frontmatter types its object as these types, and the script parses with the
// schema, so the two sides cannot drift and nothing is cast.

// Annotated with the plain TS types so a change to either side is a compile
// error here rather than a runtime surprise.
const thresholdPointSchema: GenericSchema<ThresholdPoint> = object({
	hours: number(),
	percentRemoved: number(),
	count: number(),
});

const refLineSchema: GenericSchema<RefLine> = object({
	hours: number(),
	label: string(),
});

export const thresholdConfigSchema = object({
	title: string(),
	alt: string(),
	data: array(thresholdPointSchema),
	total: number(),
	tooltipVerb: string(),
	xColumnLabel: string(),
	yColumnLabel: string(),
	refLines: array(refLineSchema),
	height: number(),
});
export type ThresholdConfig = InferOutput<typeof thresholdConfigSchema>;

const monthlyPointSchema = object({
	m: string(),
	other: number(),
	backfill: number(),
	combined: number(),
});
export type MonthlyPoint = InferOutput<typeof monthlyPointSchema>;

export const monthlyConfigSchema = object({
	points: array(monthlyPointSchema),
	trend: array(object({ m: string(), trend: number() })),
	months: array(string()),
	tickMonths: array(string()),
	niceMax: number(),
	yTicks: array(number()),
	total: number(),
	title: string(),
	height: number(),
});
export type MonthlyConfig = InferOutput<typeof monthlyConfigSchema>;
