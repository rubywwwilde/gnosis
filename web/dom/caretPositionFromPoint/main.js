import { splitIntoLinesHorizontal } from "../getClientRects/main";

const tooltip = document.getElementById("tooltip");

const blocks = Array.from(document.getElementsByClassName("text-block"))


// 2) Collapse element contents into visual line “bands” (top/bottom/left/right per line)
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

// 3) Resolve a caret position inside `el` at absolute X on its last (or first) visual line
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

function resolveOfssetAtXY(x, y) {
  const els = document.elementsFromPoint(e.clientX, e.clientY);
  const block = els.find(x => x.classList.contains("text-block"))


}

document.addEventListener('click', (e) => {
  const els = document.elementsFromPoint(e.clientX, e.clientY);
  const block = els.find(x => x.classList.contains("text-block"))

  console.log("Block", block, splitIntoLinesHorizontal(block));
})


document.addEventListener("mousemove", (e) => {
  requestAnimationFrame(() => {
    const el = blocks.filter(b => b.contains(e.target))[0]
    if (!el) {
      tooltip.style.display = "none";
      return
    };

    tooltip.textContent = resolveAtAbsX(el, e.x, "last")?.offset

    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY + 10 + "px";
    tooltip.style.display = "block";
  })
});
