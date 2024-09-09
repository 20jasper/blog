/**
 * @type {import("prettier").Config}
 */
module.exports = {
	plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
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
