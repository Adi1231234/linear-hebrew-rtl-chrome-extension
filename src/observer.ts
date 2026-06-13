// Dynamic-content tracking - coalesces DOM mutations, observes the tree, and runs a cheap periodic
// safety re-scan. Batching uses a timer (not requestAnimationFrame): rAF is paused when the tab is
// not being composited - e.g. occluded or in the background - which would delay newly rendered rows.
import { scan, processTextNode } from "./scanner";

const pending = new Set<Node>();
let scheduled = false;

const flush = (): void => {
  scheduled = false;
  const items = [...pending];
  pending.clear();
  for (const item of items) {
    if (!item.isConnected) continue;
    try {
      if (item.nodeType === Node.TEXT_NODE) processTextNode(item as Text);
      else scan(item);
    } catch {
      // One bad element must never abort the whole pass.
    }
  }
};

const schedule = (node: Node): void => {
  pending.add(node);
  if (!scheduled) {
    scheduled = true;
    setTimeout(flush, 0);
  }
};

/** Observe childList + characterData (not attributes), so our own writes never re-trigger us. */
export const watch = (target: Node): void => {
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") schedule(mutation.target);
      else if (mutation.type === "childList") mutation.addedNodes.forEach(schedule);
    }
  }).observe(target, { subtree: true, childList: true, characterData: true });
};

/** Safety net: paused while hidden; with the self-heal it re-applies stripped direction. */
export const startSafetyRescan = (intervalMs: number): void => {
  setInterval(() => {
    if (document.hidden) return;
    try {
      scan(document.body);
    } catch {
      // ignore
    }
  }, intervalMs);
};
