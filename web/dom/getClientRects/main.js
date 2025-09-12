let lastHighlightAction = null;

function* enumerate(iterable) {
  let i = 0;
  for (const value of iterable) {
    yield [i++, value];
  }
}

window.addEventListener("click", e => {
  switch(e.target.id) {
    case "button-rects-all":
      lastHighlightAction = showClientRectsForBlocks;
      showClientRectsForBlocks();
      break;
    case "button-rects-text":
      lastHighlightAction = highlightTextRects;
      highlightTextRects();
      break;
    case "button-rects-lines":
      lastHighlightAction = highlightRectsLines;
      highlightRectsLines()
      break
    case "button-rects-clear":
      lastHighlightAction = null;
      clearElementsOfClass("highlight-item");
      break;
  }
});

window.addEventListener("resize", () => {
  if (lastHighlightAction) {
    lastHighlightAction();
  }
});

export function clearElementsOfClass(className) {
  const elements = Array.from(document.getElementsByClassName(className));
  elements.forEach(el => el.remove());
}

function showClientRectsForBlocks() {
  clearElementsOfClass("highlight-item");
  const textBlocks = document.querySelectorAll(".text-block");
  textBlocks.forEach(showClientRects);
}

function highlightTextRects() {
  clearElementsOfClass("highlight-item");
  const textBlocks = document.querySelectorAll(".text-block");
  textBlocks.forEach(x => {
    higlightRects(splitIntoRectsByTextNode(x).getAllRects())
  });
}

function highlightRectsLines() {
  clearElementsOfClass("highlight-item");
  const textBlocks = document.querySelectorAll(".text-block");
  textBlocks.forEach(x => {
    const lines = splitIntoLinesHorizontal(x)
      higlightRects(lines)
    });
}

function showClientRects(element) {
  const range = document.createRange();1
  range.selectNodeContents(element);
  const rects = range.getClientRects();
  higlightRects(Array.from(rects));
}



class TextNodeToRectsMap extends Map {
  *rects() {
    for (const rects of this.values()) {
      yield* rects;
    }
  }

  getAllRects() {
    return Array.from(this.rects());
  }
}

export function splitIntoRectsByTextNode(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
  );

  const range = document.createRange();

  const textNodeToRects = new TextNodeToRectsMap();

  while (walker.nextNode()) {
    const currNode = walker.currentNode;
    range.selectNodeContents(currNode);
    // todo I can already here count stuff
    const currRects = Array.from(range.getClientRects())

    textNodeToRects.set(currNode, currRects)
  }

  return textNodeToRects
}

export function highlightElement({
  badgeTitle,
  top,
  left,
  width,
  height,
  color
}) {
  const el = document.createElement("div");
  el.className = "highlight-item";

  const newTop = top + window.scrollY;
  const newLeft = left + window.scrollX;

  el.style.position = "absolute";
  el.style.top = newTop + "px";
  el.style.left = newLeft + "px";
  el.style.width = width + "px";
  el.style.height = height + "px";
  el.style.border = `1px dashed ${color}`;
  el.style.pointerEvents = "none"

  const badge = document.createElement("div");
  badge.className = "highlight-badge";
  badge.textContent = badgeTitle;
  el.append(badge);

  document.body.append(el);
}

export function highlightRect(badgeTitle, rect, color) {
  highlightElement({
    badgeTitle,
    top: rect.top,
    left: rect.left,
    height: rect.height,
    width: rect.width,
    color: color ?? "rgba(255, 0, 0, 0.3)"
  })
}

export function higlightRects(rects) {
  for (const [i, rect] of enumerate(rects)) {
    highlightRect(i + 1, rect)
  }
}

class Line {
  constructor({ index, rects, left, right, top, bottom }) {
    // counting from 1 is extremely confusing
    this.index = index;
    this.rects = rects;
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;

    // would be really nice to include char len
    // for each rect ?
  }

  add(rect) {
    this.rects.push(rect)

    this.left = Math.min(this.left, rect.left)
    this.right = Math.max(this.right, rect.right)
    this.top = Math.min(this.top, rect.top)
    this.bottom = Math.max(this.bottom, rect.bottom)
 }

  get width() {
    return this.right - this.left
  }

  get height() {
    return this.bottom- this.top
  }
}

/**
 * Returns visual lines for a given element if the are any.
 * Lines are returned in visual order.
 * Does not work when an element streches multiple columns.
 *
 * @param {HTMLElement} el
 */
export function splitIntoLinesHorizontal(el) {
  const textRects = splitIntoRectsByTextNode(el)
    .getAllRects()

  return groupRectsByLines(textRects)
}

function groupRectsByLines(textRectsIterable) {
  const lines = []
  const getLineNumber = () => lines.length + 1

  for (const rect of textRectsIterable) {
    if (lines.length === 0 ) {
      lines.push(new Line({
            index: 1,
            rects: [rect],
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          }))
    }

    const EPS_Y = 1

    const lastLine = lines.at(-1);
    const overlapY = calcOverlapY(lastLine, rect)
    const minHeight = Math.min(getHeight(rect), getHeight(lastLine))
    const reqHeight = Math.max(EPS_Y, minHeight/2)

    if (overlapY >= reqHeight) {
      lastLine.add(rect)
      continue
    }

    lines.push(new Line({
      index: getLineNumber(),
      rects: [rect],
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      top: rect.top,
    }))
  }

  return lines
}


export function parseElementToLinesAndNodes(el) {
  const textNodeToRects = splitIntoRectsByTextNode(el)

  const lines = groupRectsByLines(textNodeToRects.rects())

  return {
    lines,
    textNodeToRects
  }
}

function getHeight(x) {
  return x.bottom - x.top
}

function calcOverlapY(a, b) {
  return Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
}
