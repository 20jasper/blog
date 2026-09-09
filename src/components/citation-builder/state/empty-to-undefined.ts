export function emptyToUndefined(value: string): string | undefined {
	return value === '' ? undefined : value;
}
