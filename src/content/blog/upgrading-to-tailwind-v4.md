---
title: 'Upgrading to Tailwind v4'
pubDate: '2025-02-01'
description: 'Upgrading my blog to Tailwind v4'
tags: []
---

I just updated this very blog to Tailwind v4—here's what I had to change!

## CSS layers

I have base styles in my `global.css` file to set various defaults

For example, I added underlines on anchors, overriding preflight

```css
a {
	text-decoration: underline;
	transition:
		color 0.2s ease,
		border-bottom-color 0.2s ease;
}
```

In my nav, I applied a Tailwind class to remove the underline, since I used borders to distinguish active links

![A navbar with white underlines under active links and orange under active links](@images/nav-link.webp)

After upgrading to Tailwind v4, the Tailwind class was overwritten by the rule in `global.css`

This is because [Tailwind v4 uses native CSS Layers](https://tailwindcss.com/blog/tailwindcss-v4-alpha#designed-for-the-modern-web), and in this case, styles in `global.css` come _after_ the base layer

The `@utilities` layer comes later than `@base` in the cascade, and therefore styles from `@utilities` override rules in `@base` no matter the specificity

```css
@layer theme, base, components, utilities;
@import './theme.css' layer(theme);
@import './preflight.css' layer(base);
@import './utilities.css' layer(utilities);
```

This was a simple enough fix, just put base styles in the `@base` layer!

```css
@layer base {
	a {
		text-decoration: underline;
		transition:
			color 0.2s ease,
			border-bottom-color 0.2s ease;
	}
}
```

## Theme variables

This is my favorite part of the new syntax. The `@theme` directive both adds CSS variables and utility classes, so I only need to update one spot!

Here's what I had before

```js
theme: {
		extend: {
			fontFamily: {
				sans: ['Arial', 'sans-serif'],
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
```

```css
:root {
	--accent: 255 152 0;
	--foreground: 241 230 216;
	--background: 0 0 19;
	--background-secondary: 48 42 79;
	--foreground-secondary: 147 147 147;
}
```

And here's what I have now!

```css
@theme {
	--color-background: rgb(0, 0, 19);
	--color-foreground: rgb(241, 230, 216);
	--color-accent: rgb(255, 152, 0);
	--color-background-secondary: rgb(48, 42, 79);
	--color-foreground-secondary: rgb(147, 147, 147);
	--font-sans: 'Arial', 'sans-serif';
}
```

It's not _that_ different, but the convenience is nice

## Compatibility

`@config` and `@plugin` can load legacy configs and plugins. This made migration much nicer because I could do it incrementally!

I use `@tailwindcss/typography` to make this blog look beautiful—if the `@plugin` directive didn't exist, I'dn't've updated!

```css
@plugin '@tailwindcss/typography';
```

It seems the analog to v3 plugins are just CSS files now. I wonder how many projects will use the new <abbr title="Domain Specific Language">DSL</abbr> over good old JavaScript

## Custom Variants

I could have stopped there, but I wanted to get rid of my config file completely. Here's how I converted a custom variant that targets inline code blocks

```js
function ({ addVariant }) {
  addVariant(
    'prose-inline-code',
    '&.prose :where(:not(pre)>code):not(:where([class~="not-prose"] *))',
  );
},
```

```css
@custom-variant prose-inline-code (&.prose :where(:not(pre)>code):not(:where([class~="not-prose"] *)));
```

If you have no clue what that CSS selector is saying, don't worry, I got you! It matches elements

- with an ancestor with the prose class
- `code` tags without a `pre` tag as a direct parent
- without an ancestor marked as not prose

---

A friend generated font size utility classes with the following

```js

const pxToRem = (px:number, base = 16) => {
  return px / base
}

const generateFontSize = () => {
  const min = 12
  const max = 100
  const fontSize = {}

  for (let i = min; i <= max; i += 2) {
    fontSize[i] = pxToRem(i) + "rem"
  }

  return fontSize
}
```

It could be replaced by the following

```css
@utility text-* {
	font-size: calc(--value(integer) * calc(1rem / 16));
}
```

Of course, this isn't exact since it allows for arbitrary sizes, but they weren't interested in migrating anyways ha

You _could_ create 44 CSS variables to match it, though it's probably not worth it, especially since the Tailwind team has done so well with backwards compatibility

## `@astrojs/tailwind` deprecation

`@astrojs/tailwind` was deprecated in favor of `@tailwindcss/vite`

A Vite plugin means the module graph can be used for content detection instead of providing glob patterns[^contentDetection]

[^contentDetection]: [Zero-configuration content detection](https://tailwindcss.com/blog/tailwindcss-v4-alpha#zero-configuration-content-detection)

You can disable automatic detection[^disableDetection], but for me, it just works&trade;!

[^disableDetection]: [Disabling automatic detection](https://tailwindcss.com/docs/detecting-classes-in-source-files#disabling-automatic-detection)

## Rust is a must

The core engine was rewritten in Rust, with one dependency—Lightning CSS, which I think is super cool!

It uses `cssparser` and `selectors` from Mozilla, which are used in Firefox, which means there's browser parity with the foundations[^lightning]!

[^lightning]: [Lightning CSS](https://lightningcss.dev/)

I recommend reading through all [the minifications Lightning CSS can apply](https://lightningcss.dev/minification.html)! It's absolutely delightful to see what it can inline and omit. It's pretty quick to scan too 😀

For the record, I have not noticed any compile time or bundle size decreases with my tiny blog. That's not to discount any advances—I was just overly optimistic about lowering my bundle size 😂

## AI Sucks at helping with new code

I wonder how long it will be until AI can help with the new version's DSL. I didn't expect it to know what was going on, but it was worse than I thought. Copilot using GPT 4o kept hallucinating errors and pasting multiple copies of my CSS file since it had no clue what was going on

Luckily, I am smarter than an LLM and could read the docs (though apparently weak willed, since I asked AI before reading the docs completely)

I asked Phind 70B after the fact, and it knew that Tailwind v4 existed and cited the docs, which is a great start! Unfortunately it got confused about directives and decided to convert all my colors to `oklch`

Long story short, and needless to say, AI isn't taking our jobs anytime soon

---

[Check out my PR to upgrade to Tailwind v4](https://github.com/20jasper/blog/pull/104/files#diff-03cc26efc9f06a95cd86aef185af462b72cc9d548a58177f8972837895f2de9eR4) and [my follow up PR to remove a `!important`](https://github.com/20jasper/blog/commit/1af4b4a2a5216da75fb737ea9141373333f36b04)

Let me know if you had any migration woes or have any opinions about the new DSL—I'm interested to hear what y'all think!
