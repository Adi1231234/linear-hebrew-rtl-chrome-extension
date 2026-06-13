# RTL for Linear

A Chrome extension that displays **right-to-left languages** correctly across all of
[Linear](https://linear.app).

Any line that contains **more than one RTL word** is switched to right-to-left, so mixed
RTL/Latin sentences read correctly. A single RTL word inside otherwise-Latin text is left as-is.
Works for every RTL script (Arabic, Persian, Urdu, and others) via Unicode code-point ranges.

> Not affiliated with, or endorsed by, Linear. "Linear" is a trademark of its respective owner,
> used here only to describe compatibility.

## What it handles

- **Board / kanban** - the card flips to RTL and the title aligns to the right edge.
- **List & saved views** - the whole list is mirrored through its grid (id/title on the right,
  labels/date on the left) without breaking the layout.
- **Issue view** - title and breadcrumb align right.
- **Rich-text editors (title / description / comments)** - handled with a CSS rule
  (`unicode-bidi: plaintext`) that survives the editor's re-renders.
- **Command palette, inbox, search** - RTL titles read correctly.

Dynamic content is picked up automatically via `MutationObserver`, so scrolling, view switches
and live typing all work.

## Build

```bash
npm install
npm run build      # bundles src/*.ts -> dist/content.js (esbuild, IIFE)
npm run typecheck  # tsc --noEmit
```

## Install (Load unpacked)

1. `npm install && npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. **Load unpacked** and select this folder
5. Reload Linear

## Code structure

TypeScript modules under `src/`, each with a single responsibility and reusable, side-effect-free
functions. esbuild bundles them into `dist/content.js`.

- `rtl-text.ts` - RTL text detection (pure; no DOM).
- `layout.ts` - Linear layout classification (board card / list grid / block / skip).
- `direction.ts` - apply & revert direction for one element (self-healing).
- `scanner.ts` - tree walking + per-node processing.
- `editor-css.ts` - the rich-text editor CSS rule.
- `observer.ts` - mutation batching + observer + periodic safety re-scan.
- `main.ts` - bootstrap.

## Resilience

- Detection is based on text content and generic structure (`display`, dimensions, issue `href`),
  never on the host's CSS class names.
- Graceful degradation: if an alignment heuristic stops matching, text still gets `dir=rtl` and
  stays readable; nothing is removed and the page is not broken.
- Self-heal: if the host strips an injected `dir` on a re-render, a cheap periodic re-scan
  (paused while the tab is hidden) re-applies it.
- A `try/catch` around each element keeps one bad node from aborting the whole pass.

## License

MIT
