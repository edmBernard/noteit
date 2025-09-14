<p align="center">
  <img src="public/favicon.svg" alt="NoteIt icon" width="96" height="96" />
</p>

# NoteIt

Minimal, zero-backend note taking for the browser powered by React + Lexical. Open the app and start typing—every note is persisted locally. Designed to feel instant, minimal and try to be mobile-friendly.

- Repository : [https://github.com/edmBernard/noteit](https://github.com/edmBernard/noteit)
- Demo : [Demo](https://edmbernard.github.io/noteit/)

> Disclaimer : It's a toy project for myself. I'm not a JS dev, so don't expect good quality code.

## Features

- Infinite note list UX: a new empty editor is auto‑added when the last note gains content, and redundant trailing empties are pruned.
- Local persistence: each note saves to `localStorage` (debounced) and is restored on reload with no manual action.
- "Rich" text lists: bullet, numbered, and checklist support (Lexical list nodes).
- Mobile friendly: I tried. my main usage if from a mobile, so I tried to make it work on mobile As good as I can.

## Persistence Details

We use `LocalStorage` from the browser to keep data between usage. That mean data will be loss if you clean browser data.

## Getting Started

Clone & run:

```bash
git clone <repo-url>
cd noteit
bun install
bun run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Deployment (GitHub Pages via subtree)

This project can be published to GitHub Pages by pushing the built `dist/` folder to a `gh-pages` branch. A simple approach already used:

```bash
bun run build
git subtree push --prefix dist origin gh-pages
```
