// Direction control - applies/reverts text direction for a single element. Owns per-element state.
import { isRtlLine } from "./rtl-text";
import { boardCard, isBlock, isInlineRef, listMasterGrid } from "./layout";

type Direction = "rtl" | "ltr";

const lastDirection = new WeakMap<HTMLElement, Direction>();
const flippedCard = new WeakMap<HTMLElement, HTMLElement>();

/** Right-align the element's line for the layout it lives in. */
const align = (el: HTMLElement): void => {
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

const unalign = (el: HTMLElement): void => {
  el.style.textAlign = "";
  const card = flippedCard.get(el);
  if (card) {
    card.removeAttribute("dir");
    flippedCard.delete(el);
  }
};

/** Decide and apply direction for one element that directly holds text. Idempotent, self-healing. */
export const updateDirection = (el: Element): void => {
  if (!(el instanceof HTMLElement) || el.isContentEditable) return; // editors handled by CSS
  if (isInlineRef(el)) return; // breadcrumbs / inline mentions read RTL via bidi already
  const previous = lastDirection.get(el);

  if (isRtlLine(el.textContent ?? "")) {
    if (previous === "rtl" && el.getAttribute("dir") === "rtl") return; // re-apply only if stripped
    el.setAttribute("dir", "rtl");
    align(el);
    lastDirection.set(el, "rtl");
  } else if (previous === "rtl") {
    el.removeAttribute("dir");
    unalign(el);
    lastDirection.set(el, "ltr");
  }
};
