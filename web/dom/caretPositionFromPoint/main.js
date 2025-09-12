import { clearElementsOfClass, higlightRects, parseElementToLinesAndNodes } from "../getClientRects/main";

const tooltip = document.getElementById("tooltip");

const blocks = Array.from(document.getElementsByClassName("text-block"))


function lineBandsForElement(el, eps = 2 / devicePixelRatio) {
  const whole = document.createRange();
  whole.setStart(el, 0);
  whole.setEndAfter(el.lastChild ?? el);

  const rows = [];
  for (const r of whole.getClientRects()) {
    let band = rows.find((b) => Math.abs(b.top - r.top) < eps);
    if (!band)
      rows.push(
        (band = { top: r.top, bottom: r.bottom, left: r.left, right: r.right }),
      );
    else {
      band.top = Math.min(band.top, r.top);
      band.bottom = Math.max(band.bottom, r.bottom);
      band.left = Math.min(band.left, r.left);
      band.right = Math.max(band.right, r.right);
    }
  }
  rows.sort((a, b) => a.top - b.top);
  return rows;
}

export function resolveAtAbsX(
  el,
  absX,
  which,
) {
  const bands = lineBandsForElement(el);
  if (!bands.length) {
    const end = document.createRange();
    end.selectNodeContents(el);
    return { node: end.endContainer, offset: end.endOffset };
  }
  const band = which === "first" ? bands[0] : bands[bands.length - 1];

  // Minimal clamp so the point hits the element (still honors your absolute X when possible)
  const box = el.getBoundingClientRect();
  const x = Math.max(box.left + 1, Math.min(absX, box.right - 1));
  const y = which === "first" ? band.top + 1 : band.bottom - 1;

  const pos =
    document.caretPositionFromPoint?.(x, y) ||
    document.caretRangeFromPoint?.(x, y);
  if (!pos) return null;

  return "offsetNode" in pos
    ? { node: pos.offsetNode, offset: pos.offset }
    : { node: pos.startContainer, offset: pos.startOffset };
}

/**
 *
 * @param {{ top: number; bottom: number}} lines - Y-positions of horizontal lines, sorted in ascending order (top→bottom).
 * @param {number} y
 */
function resolveLineAtY(lines, y) {
  return lines.find(line => line.top < y && line.bottom > y)
}

function resolveRectAtX(line, x) {
  return line.rects.find(rect => rect.left < x && rect.right > x) || line.rects.at(-1)
}

function rangeFromPoint(x, y) {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y);        // Chrome/Safari
  }
  if (document.caretPositionFromPoint) {              // Firefox
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    const r = document.createRange();
    r.setStart(pos.offsetNode, pos.offset);
    r.collapse(true);
    return r;
  }
  return null;
}

function resolveOffsetAtXY(x, y) {
  // todo feat to use already caculated data
  const els = document.elementsFromPoint(x, y);
  const block = els.find(x => x.classList.contains("text-block"))
  if (!block) return;

  const caret = rangeFromPoint(x, y);
  if (!caret || !block.contains(caret.startContainer)) return null;

  const {textNodeToRects} = parseElementToLinesAndNodes(block)
  const {offset, offsetNode} = document.caretPositionFromPoint(x, y)

  const range = document.createRange()
  let elementFound = false;
  let accOffset = 0
  for (const textNode of textNodeToRects.keys()) {
    if (textNode === offsetNode) {
      elementFound = true;
      break;
    }
    range.selectNodeContents(textNode)
    accOffset += range.endOffset
  }
  if (!elementFound) {
    throw new Error("This should never happen. Element not found in the block")
  }

  return accOffset + offset
}


document.addEventListener('selectionchange', (e) => {
  const selection = document.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0).cloneRange();

  range.collapse(true);

  const r = range.getBoundingClientRect();

  var x = (r.left + r.right)/2;
  var y = (r.top + r.bottom)/2;
  console.log(x, y)

  clearElementsOfClass("highlight-item");

  const els = document.elementsFromPoint(x, y);
  const block = els.find(x => x.classList.contains("text-block"))
  if (!block) return;

  const {lines, textNodeToRects} = parseElementToLinesAndNodes(block)

  const line = resolveLineAtY(lines, y)
  if (!line) {
    console.warn("line not found")
    return
  }

  const index = line.index - 2
  if (index < 0) return;

  const lineHigher = lines[index]

  const rect = resolveRectAtX(lineHigher, x)
  if (!rect) return
  const newY = (rect.top + rect.bottom) / 2
  const offset = resolveOffsetAtXY(x ,newY)

  // calculate the best position to jump.
  higlightRects([rect])


  console.log(offset)

})


document.addEventListener("mousemove", (e) => {
  requestAnimationFrame(() => {
    const el = blocks.filter(b => b.contains(e.target))[0]
    if (!el) {
      tooltip.style.display = "none";
      return
    };

    const offset = resolveOffsetAtXY(e.x, e.y)

    tooltip.textContent = String(offset)

    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY + 10 + "px";
    tooltip.style.display = "block";
  })
});
