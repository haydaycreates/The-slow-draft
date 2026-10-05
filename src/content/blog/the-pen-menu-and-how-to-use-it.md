---
title: "The pen menu, and how to write with it"
date: "2026-10-05"
updated: "2026-10-05"
tags: ["guide", "writing"]
summary: "Nine pens, six highlighters, nine typefaces and a live preview — a short manual for the writing desk."
featured: true
---

This post is the manual. Everything you see was typed as ordinary text and then given a colour, a typeface or a highlighter from the **Pen** menu. Open it in *Posts → Edit* to watch it happen.

## Nine pens

<span class="c-terracotta">Terracotta</span> is the house colour — good for the sentence you want remembered. <span class="c-blue">Blue</span> reads like a quieter voice, <span class="c-green">green</span> for what worked, <span class="c-plum">plum</span> for an aside and <span class="c-amber">amber</span> for caution. When you need to raise your voice politely: <span class="c-crimson">crimson for the thing that matters</span>, <span class="c-indigo">indigo for the theory</span>, <span class="c-teal">teal for the practical bit</span>.

A whole paragraph can carry a colour, but a paragraph in one colour is a shout. Use it like a marking pen on paper: a clause here, a name there.

## Six highlighters

<mark class="hl-yellow">Yellow</mark> is the classic, the one that survives photocopying. <mark class="hl-mint">Mint</mark> is calmer and good for lists, <mark class="hl-sky">sky</mark> pairs with blue links, <mark class="hl-rose">rose</mark> is for warnings that should still feel kind, and there is <mark class="hl-lavender">lavender</mark> for the dreamy bits and <mark class="hl-peach">peach</mark> for the warm ones.

## Nine typefaces

The whole site is set in <span class="f-lora">Lora</span> with <span class="f-playfair">Playfair Display</span> headlines — both chosen in **Settings → Appearance**. Inside a paragraph you can switch to any of them:

<span class="f-merriweather">Merriweather is sturdy and screen-friendly</span>. <span class="f-inter">Inter is the modern interface sans, the one software is made of</span>. <span class="f-poppins">Poppins is geometric and cheerful</span>. <span class="f-jetbrains">JetBrains Mono keeps code honest — const truth = 42;</span>

Use it for a change of voice, a quotation, a piece of code or a single word that deserves the spotlight.

## Body, headings, size

Three site-wide choices live in **Settings → Appearance**: the body typeface, the heading typeface, and the reading size (smaller, comfortable, larger). Change them and every post, page and card follows immediately — the colours and inline typefaces you write stay exactly as they are.

## Pasted text behaves

Copy a coloured paragraph from a document and paste it in: the colours and fonts snap to the closest thing in this library, so a post never looks like a ransom note. Bold, italics, links, lists, quotes and images come across too.

## How to use it, in four steps

1. Write normally — Design mode is a real editor, no Markdown required.
2. Select the words you want to change.
3. Open the **Pen** menu and pick a colour, a highlighter or a typeface.
4. Press **Publish**. Readers see exactly what you saw.

> The prettiest writing tool is the one that gets out of the way of the sentence.

Prefer plain text? Switch to **Markdown** at the top of the editor at any moment — the same post, in its source form. Switch back and your formatting is still there.

---

*Want to change the palette itself? The nine pens and six highlighters live in lib/sanitize.js, the typefaces in lib/fonts.js, and the test script asserts the server and the browser agree. Fonts are self-hosted: run node scripts/fetch-fonts.js to add another face.*
