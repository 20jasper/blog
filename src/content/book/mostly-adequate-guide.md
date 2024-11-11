---
title: Professor Frisby's Mostly Adequate Guide to Functional Programming
author: Brian Lonsdorf
description: A humorous guide to functional programming without the jargon
readDate:
  start: '2023-06-19'
  end: '2023-08-19'
---

I read this book a year ago, so I'd like to revisit it and provide more thorough feedback. I figure my Rust knowledge will transfer well, and I'm planning on learning Gleam, so it can't hurt!

## Overview

This book is an accessible and witty take on functional programming—it isn't a "tome!" It's written in JavaScript, so the barrier to entry isn't too high

Since the included exercises use Node 10, so it was a bit jarring moving back to a life without modules. [The book is being updated to ES6](https://github.com/MostlyAdequate/mostly-adequate-guide/pull/235) if you'd like to help!

The book holds well—I highly recommend it to anyone looking to dip their feet into Functional Programming

## The Case for Purity

If you read any part of this book, read ["The Case for Purity"](https://mostly-adequate.gitbook.io/mostly-adequate-guide/ch03#the-case-for-purity).

Pure functions are

- cacheable
- testable
- portable
- transparent (can tell all dependencies from function signature)
- parallelizable
