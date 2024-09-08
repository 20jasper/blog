/**
 * @type {import("prettier").Config}
 */
module.exports = {
	plugins: [require.resolve('prettier-plugin-astro')],
	overrides: [
		{
			files: '**/*.astro',
			options: {
				parser: 'astro',
			},
		},
	],

	semi: true,
	tabWidth: 2,
	singleQuote: true,
	useTabs: true,
	singleAttributePerLine: true,
};
