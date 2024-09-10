/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Poppins', 'sans-serif'],
			},
			colors: {
				background: 'rgb(var(--background))',
				foreground: 'rgb(var(--foreground))',
				accent: 'rgb(var(--accent))',
				'background-secondary': 'rgb(var(--background-secondary))',
				'foreground-secondary': 'rgb(var(--foreground-secondary))',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		function ({ addVariant }) {
			addVariant(
				'prose-inline-code',
				'&.prose :where(:not(pre)>code):not(:where([class~="not-prose"] *))',
			);
		},
	],
};
