// Shared class strings for the small pieces repeated across field-row.astro,
// radio-group.astro, and citation-builder.ui.astro, so they stay in sync
// instead of drifting between copies.

export const labelClass = 'text-base font-semibold text-foreground';
// The "label + stuff underneath" column shell, shared by radio groups,
// field rows, and the standalone Id. checkbox row.
export const stackClass = 'flex w-full flex-col gap-1';

// The enabled/disabled treatment shared by text and select inputs -- see
// text-field.astro's comment for why disabled uses a dashed border rather
// than just a color change.
export const fieldClass =
	'block w-full min-w-0 max-w-full box-border rounded-md border border-foreground-secondary/70 bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:border-dashed disabled:border-foreground-secondary/50 disabled:bg-foreground-secondary/10 disabled:text-foreground-secondary';
