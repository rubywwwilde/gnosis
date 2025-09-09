
window.addEventListener("click", e => {
  switch(e.target.id) {
    case "button-rects-all":
      showClientRectsForBlocks()
      break;
    case "button-rects-text":
      highlightTextRects()
      break;
    case "button-rects-clear":
      clearElementsOfClass("highlight-item")
      break;
  }
})

function clearElementsOfClass(className) {

  const elements = Array.from(document.getElementsByClassName(className))

  elements.forEach(el => el.remove())
}

function showClientRectsForBlocks() {
  clearElementsOfClass("highlight-item")
  const textBlocks = document.querySelectorAll(".text-block")
  debugger
  textBlocks.forEach(showClientRects)
}

function highlightTextRects() {
  clearElementsOfClass("highlight-item")
  const textBlocks = document.querySelectorAll(".text-block")

  textBlocks.forEach(splitIntoTextRects)
}


function showClientRects(element) {
  const range = document.createRange()
  range.selectNodeContents(element)

  const rects = range.getClientRects()

  higlightRects(Array.from(rects))
}

function splitIntoTextRects(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
  )

  const rects = []

  const range = document.createRange()
  while (walker.nextNode()) {
    range.selectNodeContents(walker.currentNode);
    rects.push(...Array.from(range.getClientRects()))
  }

  higlightRects(rects)
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
