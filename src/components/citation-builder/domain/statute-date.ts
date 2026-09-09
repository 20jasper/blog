export type StatuteDateInput =
	| { materialLocation: 'main'; year: number }
	| {
			materialLocation: 'supplement';
			supplementDesignation: string;
			supplementYear: number;
	  }
	| {
			materialLocation: 'both';
			year: number;
			supplementDesignation: string;
			supplementYear: number;
	  };

// r[impl statute.material-location]
// r[impl statute.supplement-pairing]
export function assembleStatuteDate(input: StatuteDateInput): string {
	switch (input.materialLocation) {
		case 'main':
			return `${input.year}`;
		case 'supplement':
			return `${input.supplementDesignation} ${input.supplementYear}`;
		case 'both':
			return `${input.year} & ${input.supplementDesignation} ${input.supplementYear}`;
	}
}
