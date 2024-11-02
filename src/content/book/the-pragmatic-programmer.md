---
title: The Pragmatic Programmer
author: Brian Lonsdorf
link: https://mostly-adequate.gitbook.io/mostly-adequate-guide
description: A humorous guide to functional programming without the jargon
readDate: '2023-08-19'
---

<details>
<summary>
Table of Contents
</summary>

- [Filling in the gaps](#filling-in-the-gaps)
- [Reevaluating my portfolio](#reevaluating-my-portfolio)
- [Foreword](#foreword)
- [Communication](#communication)
  - [Always Answer](#always-answer)
  - [Outline](#outline)
- [Easier to Change](#easier-to-change)
- [Project Planning](#project-planning)
- [Design by Contract](#design-by-contract)
- [Don't code by coincidence](#dont-code-by-coincidence)
</details>

I'm not here to summarize—rather I'll share the pieces I found most insightful

## Filling in the gaps

While every chapter of <cite>The Pragmatic Programmer</cite> wasn't game-changing[^1] for me, it's a great read overall

[^1]: If you don't need to be told how to use version control or Big O Notation, skip those sections. Like the book mentions, it's not a novel—read the sections that interest you!

I got the most value from formalizing topics I had instinctual or passing knowledge of and the "challenges" to apply what you read to your life

A lot of lessons I learned the hard way[^2] are in this book—as well as some I was actively learning

[^2]:
    I will write an article on this at some point <br/>
    On that note, I wonder the efficacy of reading versus experience. I've seen a few friends make the same mistakes, and it only stuck after facing the consequences of their naiveté

## Reevaluating my portfolio

I got my goal of one technical book per month and a language per year from <cite>The Pragmatic Programmer</cite>!

I spent almost a year trying to understand the Rust Book deeply, but no one can memorize everything. Ultimately I stopped [teaching the Rust Book][rustBookClub] 75% of the way through to focus on more important things. As <cite>The Pragmatic Programmer</cite> recommends, always reevaluate your knowledge investments

## Foreword

I identify with the forward—like [Saron](https://saron.io/), I didn't tinker with tech when I was younger, and I didn't go to college for anything computer related

If you have a similar story, don't be scared to reach out! I wonder how many of us are out there

## Communication

### Always Answer

Always get back to someone, even if you say "I'll get back to you later." While reading this book, someone left me on read 3 times, and I went through other means to get what I needed.

### Outline

It's easy to word vomit, but you should plan

## Easier to Change

Before reading <cite>The Pragmatic Programmer</cite>, I had trouble explaining why coupling was bad. David and Andrew put it elegantly

> [W]e believe in the ETC principle: Easier to Change. ETC. That's it.

Why should you follow <abbr title="Don't Repeat Yourself">DRY</abbr>? It's easier to change

Why should write orthogonal code? It's easier to change

The book recommends tagging bug fixes to see how many modules need modified to fix it

## Project Planning

Make clear prototypes are disposable and won't be deployed

---

The units used affect the perception of your estimate. For example, 100 days is much more precise than 4 months, which conveys confidence in the estimate. 100 days will be perceived as "90 to 110 days" and 4 months will be perceived as "3 to 5 months"

The best way to way to estimate is to have already done it. The next best is to talk to someone who already did it

Estimate based on a model of your system. Find the most important parameters and focus efforts there

Never give an estimate without doing some research first

> I want to give you an accurate estimate, so I’ll get back to you as soon as possible with a good estimate

Make sure to clarify any assumptions

> Assuming my IntelliJ settings don't get rolled back again, I can have the PR out by tomorrow[^3]

[^3]: 😔👊

Your estimates get better over time, so provide multiple estimates to avoid padding

> If I'm focused, this blog will take 6 hours to write. If I get hungry, I'll need to make cheesy potatoes[^4], which will add an hour or two. If I go down a rabbit hole looking for all the leaked Pokemon sprites, it will take 9 hours total[^5] [^6]

[^4]: I also ate a Bloomin Onion

[^5]: I may or may not have done all of these things

[^6]: It took me 3 hours, 29 minutes and 15 seconds to write this blog

Track your estimations and how you got there. If it's wrong, find out why[^7]

[^7]: I got the estimation exercise in the book wrong since I trusted Google AI to do math. Don't ask me why I did that

## Design by Contract

TODO:

I think the concept is so cool

made me want to go for elixir over gleam

Branch coverage is fallible, you should be testing all the states of your system

## Don't code by coincidence

I recently came across a nasty race condition. I came up with a few hacky solutions like

- run the code twice
- reorder and leave a giant comment explaining why it has to be in this specific order
- add even more `Thread.sleep` statements

At the end of the day, I didn't have the tools to debug 100s of event listeners were fighting each other at the same time, and I couldn't be 100% sure that any of these solutions were infallible, and the pressure of the sprint is not a valid excuse for pushing code that _sometimes_ works

I took the time to design a solution that bypassed all of these multithreading shenanigans, and at least for a moment, I am free

<video autoplay loop muted controls="false" class="w-full" aria-label="An ethereal being ascending">
  <source src="/ascending-energy.mp4" type="video/mp4">
</video>

<!-- ## Outro

I love footnotes. It's just so nice to throw my tangents[^100] out there without ruining the pacing of the blog

[^100]: Moo Deng is really cute. That is all -->

[rustBookClub]: https://www.youtube.com/playlist?list=PLvCS6xtuAGQUvObgEGJ8YSqQMJmDTNBOm
