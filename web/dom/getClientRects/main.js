let lastHighlightAction = null;

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

function clearElementsOfClass(className) {
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
    higlightRects(splitIntoTextRects(x))
  });
}

function highlightRectsLines() {
  clearElementsOfClass("highlight-item");
  const textBlocks = document.querySelectorAll(".text-block");
  textBlocks.forEach(x => {
    const lines = splitIntoLinesHorizontal(x);
    // debugger;
      higlightRects(lines)
    });
}

function showClientRects(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const rects = range.getClientRects();
  higlightRects(Array.from(rects));
}

function splitIntoTextRects(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
  );

  const rects = [];
  const range = document.createRange();
  while (walker.nextNode()) {
    range.selectNodeContents(walker.currentNode);
    rects.push(...Array.from(range.getClientRects()));
  }

  return rects
}

function higlightRects(rects) {
  rects.forEach((rect, i) => {
    const el = document.createElement("div");
    el.className = "highlight-item";

    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    el.style.position = "absolute";
    el.style.top = top + "px";
    el.style.left = left + "px";
    el.style.width = rect.width + "px";
    el.style.height = rect.height + "px";
    el.style.border = "1px dashed rgba(255, 0, 0, 0.6)";

    const badge = document.createElement("div");
    badge.className = "highlight-badge";
    badge.textContent = i + 1;
    el.append(badge);

    document.body.append(el);
  });
}

class Line {
  constructor(index, rect) {
    this.index = index;
    this.rects = [rect];
    this.left = rect.left;
    this.right = rect.right;
    this.bottom = rect.bottom;
    this.top = rect.top;
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
  const textRects = splitIntoTextRects(el)
    .filter(r => r.height !== 0) // why does it actually makes sense to filter


  const lines = []
  const getLineNumber = () => lines.length + 1
  textRects.forEach((rect, index) => {
    if (lines.length === 0 ) {
      lines.push(new Line(getLineNumber(), {
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        top: rect.top,
        node: rect.node,
        range: rect.range
      }))
    }

    const EPS_Y = 1

    const lastLine = lines.at(-1);
    const overlapY = calcOverlapY(lastLine, rect)
    const minHeight = Math.min(getHeight(rect), getHeight(lastLine))
    const reqHeight = Math.max(EPS_Y, minHeight/2)

    if (overlapY >= reqHeight) {
      lastLine.add(rect)
      return
    }

    lines.push(new Line(getLineNumber(), {
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      top: rect.top,
      node: rect.node,
      range: rect.range
    }))

  })

  return lines
  }

function getHeight(x) {
  return x.bottom - x.top
}

function calcOverlapY(a, b) {
  return Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
}
