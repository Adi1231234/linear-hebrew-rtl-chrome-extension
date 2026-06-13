"use strict";
(() => {
  // src/editor-css.ts
  var SELECTOR = ":is([contenteditable],.ProseMirror) :is(.text-node,p,div,li,h1,h2,h3,h4,blockquote)";
  var injectEditorCss = () => {
    const style = document.createElement("style");
    style.textContent = `${SELECTOR}{unicode-bidi:plaintext;text-align:start;}`;
    (document.head ?? document.documentElement).appendChild(style);
  };

  // src/rtl-text.ts
  var RTL_RANGES = [
    [1424, 2303],
    [64285, 65023],
    [65136, 65279]
  ];
  var RTL = new RegExp(
    `[${RTL_RANGES.map(([lo, hi]) => `${String.fromCharCode(lo)}-${String.fromCharCode(hi)}`).join("")}]`
  );
  var hasRtl = (text) => RTL.test(text);
  var rtlWordCount = (text) => {
    let count = 0;
    for (const token of text.split(/\s+/)) {
      if (RTL.test(token) && ++count > 1) return count;
    }
    return count;
  };
  var isRtlLine = (text) => rtlWordCount(text) > 1;

  // src/layout.ts
  var SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "NOSCRIPT"]);
  var BLOCK_DISPLAYS = /* @__PURE__ */ new Set(["block", "flex", "grid", "list-item", "table-cell", "flow-root"]);
  var ISSUE_LINK = 'a[href*="/issue/"], a[href*="/issues/"]';
  var isSkippableTag = (tagName) => SKIP_TAGS.has(tagName);
  var isSkipped = (el) => {
    for (let node = el; node; node = node.parentElement) {
      if (SKIP_TAGS.has(node.tagName)) return true;
    }
    return false;
  };
  var isBlock = (el) => BLOCK_DISPLAYS.has(getComputedStyle(el).display);
  var boardCard = (el) => {
    const link = el.closest(`${ISSUE_LINK}, a[href*="/project/"]`);
    if (!link || getComputedStyle(link).display === "grid") return null;
    return link.getBoundingClientRect().height > 56 ? link : null;
  };
  var listMasterGrid = (el) => {
    const row = el.closest(ISSUE_LINK);
    if (!row || getComputedStyle(row).display !== "grid") return null;
    let grid = row;
    while (grid && /subgrid|none/.test(getComputedStyle(grid).gridTemplateColumns)) {
      grid = grid.parentElement;
    }
    return grid;
  };

  // src/direction.ts
  var lastDirection = /* @__PURE__ */ new WeakMap();
  var flippedCard = /* @__PURE__ */ new WeakMap();
  var align = (el) => {
    if (isBlock(el)) el.style.textAlign = "right";
    const card = boardCard(el);
    if (card && card !== el && !card.isContentEditable && card.getAttribute("dir") !== "rtl") {
      card.setAttribute("dir", "rtl");
      flippedCard.set(el, card);
      return;
    }
    if (!card) {
      const grid = listMasterGrid(el);
      if (grid && grid.style.direction !== "rtl") grid.style.direction = "rtl";
    }
  };
  var unalign = (el) => {
    el.style.textAlign = "";
    const card = flippedCard.get(el);
    if (card) {
      card.removeAttribute("dir");
      flippedCard.delete(el);
    }
  };
  var updateDirection = (el) => {
    if (!(el instanceof HTMLElement) || el.isContentEditable) return;
    const previous = lastDirection.get(el);
    if (isRtlLine(el.textContent ?? "")) {
      if (previous === "rtl" && el.getAttribute("dir") === "rtl") return;
      el.setAttribute("dir", "rtl");
      align(el);
      lastDirection.set(el, "rtl");
    } else if (previous === "rtl") {
      el.removeAttribute("dir");
      unalign(el);
      lastDirection.set(el, "ltr");
    }
  };

  // src/scanner.ts
  var addParent = (textNode, set) => {
    const el = textNode.parentElement;
    if (el && !isSkipped(el)) set.add(el);
  };
  var collectRtlElements = (root) => {
    const found = /* @__PURE__ */ new Set();
    if (root.nodeType === Node.TEXT_NODE) {
      if (hasRtl(root.nodeValue ?? "")) addParent(root, found);
      return found;
    }
    if (!(root instanceof Element) || isSkippableTag(root.tagName)) return found;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => hasRtl(n.nodeValue ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) addParent(node, found);
    return found;
  };
  var scan = (root) => collectRtlElements(root).forEach(updateDirection);
  var processTextNode = (textNode) => {
    const el = textNode.parentElement;
    if (el && !isSkipped(el)) updateDirection(el);
  };

  // src/observer.ts
  var pending = /* @__PURE__ */ new Set();
  var scheduled = false;
  var flush = () => {
    scheduled = false;
    const items = [...pending];
    pending.clear();
    for (const item of items) {
      if (!item.isConnected) continue;
      try {
        if (item.nodeType === Node.TEXT_NODE) processTextNode(item);
        else scan(item);
      } catch {
      }
    }
  };
  var schedule = (node) => {
    pending.add(node);
    if (!scheduled) {
      scheduled = true;
      setTimeout(flush, 0);
    }
  };
  var watch = (target) => {
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") schedule(mutation.target);
        else if (mutation.type === "childList") mutation.addedNodes.forEach(schedule);
      }
    }).observe(target, { subtree: true, childList: true, characterData: true });
  };
  var startSafetyRescan = (intervalMs) => {
    setInterval(() => {
      if (document.hidden) return;
      try {
        scan(document.body);
      } catch {
      }
    }, intervalMs);
  };

  // src/main.ts
  var SAFETY_RESCAN_MS = 2e3;
  var start = () => {
    injectEditorCss();
    scan(document.body);
    watch(document.body);
    startSafetyRescan(SAFETY_RESCAN_MS);
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
