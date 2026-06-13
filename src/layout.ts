// Linear layout classification - decides which RTL strategy fits a given element.
// Reusable: each function takes an element and has no side effects.

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "NOSCRIPT"]);
const BLOCK_DISPLAYS = new Set(["block", "flex", "grid", "list-item", "table-cell", "flow-root"]);
// Issue links are the stable, semantic hook for cards/rows (resilient to class renames).
const ISSUE_LINK = 'a[href*="/issue/"], a[href*="/issues/"]';

export const isSkippableTag = (tagName: string): boolean => SKIP_TAGS.has(tagName);

export const isSkipped = (el: Element): boolean => {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (SKIP_TAGS.has(node.tagName)) return true;
  }
  return false;
};

export const isBlock = (el: Element): boolean => BLOCK_DISPLAYS.has(getComputedStyle(el).display);

/** A tall vertical board card; flipping the whole card moves its title to the right edge. */
export const boardCard = (el: Element): HTMLElement | null => {
  const link = el.closest<HTMLElement>(`${ISSUE_LINK}, a[href*="/project/"]`);
  if (!link || getComputedStyle(link).display === "grid") return null;
  return link.getBoundingClientRect().height > 56 ? link : null;
};

/** For a subgrid row, the master grid that defines the columns; flipping it mirrors the list. */
export const listMasterGrid = (el: Element): HTMLElement | null => {
  const row = el.closest<HTMLElement>(ISSUE_LINK);
  if (!row || getComputedStyle(row).display !== "grid") return null;
  let grid: HTMLElement | null = row;
  while (grid && /subgrid|none/.test(getComputedStyle(grid).gridTemplateColumns)) {
    grid = grid.parentElement;
  }
  return grid;
};

/**
 * A small inline issue/project reference (breadcrumb, mention) - not a board card or grid row.
 * The browser's bidi already orders its text right-to-left; flipping it only reorders the id and
 * title and collapses their spacing, so these are left untouched.
 */
export const isInlineRef = (el: Element): boolean => {
  const link = el.closest<HTMLElement>(`${ISSUE_LINK}, a[href*="/project/"]`);
  if (!link || getComputedStyle(link).display === "grid") return false;
  return link.getBoundingClientRect().height <= 56;
};
