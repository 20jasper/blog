export default {
	plugins: [
		'remark-frontmatter',
		'remark-gfm',
		'remark-math',
		[
			'remark-validate-links',
			{ root: 'public', skipPathPatterns: ['public/blog/'] },
		],
	],
};
