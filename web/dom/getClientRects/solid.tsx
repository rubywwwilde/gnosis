import { render } from "solid-js/web";
import { createSignal, createMemo, onMount, onCleanup, For } from "solid-js";

type RectPOJO = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type RectItem = {
  index: number;
  rect: RectPOJO;
  color: string;
};

type LineGroup = {
  index: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  height: number;
  rects: RectItem[];
};

function cloneRect(r: DOMRectReadOnly): RectPOJO {
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    left: r.left,
  };
}

// Cool hues (cyan→blue→purple), moderate chroma so they look nice on white
function randomCoolOklch(): string {
  const h = Math.floor(180 + Math.random() * 120); // 180..300
  const l = +(0.60 + Math.random() * 0.20).toFixed(2); // 0.60..0.80
  const c = +(0.10 + Math.random() * 0.22).toFixed(2); // 0.10..0.32
  return `oklch(${l} ${c} ${h})`;
}

function Counter() {
  const [rects, setRects] = createSignal<RectItem[]>([]);
  let container!: HTMLDivElement;

  const measure = () => {
    const range = document.createRange();
    range.selectNodeContents(container);
    const items = Array.from(range.getClientRects()).map((r, i) => ({
      index: i,
      rect: cloneRect(r),
      color: randomCoolOklch(),
    }));
    setRects(items);
  };

  // Group rects into "lines" by similar top (±EPS px)
  const EPS = 0.75; // tolerance for row grouping
  const lines = createMemo<LineGroup[]>(() => {
    const list = [...rects()].sort(
      (a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left
    );
    const groups: LineGroup[] = [];
    for (const it of list) {
      const t = it.rect.top;
      const g = groups.find((G) => Math.abs(G.top - t) <= EPS);
      if (g) {
        g.rects.push(it);
        g.top = Math.min(g.top, it.rect.top);
        g.bottom = Math.max(g.bottom, it.rect.bottom);
      } else {
        groups.push({
          index: 0, // temp
          top: it.rect.top,
          left: it.rect.left,
          right: it.rect.right,
          bottom: it.rect.bottom,
          height: it.rect.height,
          rects: [it],
        });
      }
    }
    // finalize metrics + indices
    groups.forEach((G, idx) => {
      G.index = idx;
      G.left = Math.min(...G.rects.map((r) => r.rect.left));
      G.right = Math.max(...G.rects.map((r) => r.rect.right));
      G.bottom = Math.max(...G.rects.map((r) => r.rect.bottom));
      G.height = Math.max(...G.rects.map((r) => r.rect.height));
    });
    return groups;
  });

  onMount(() => {
    measure();
    // Re-measure on viewport/container changes
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    const onWinResize = () => measure();
    window.addEventListener("resize", onWinResize);
    onCleanup(() => {
      ro.disconnect();
      window.removeEventListener("resize", onWinResize);
    });
  });

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div style={{ display: "grid", "grid-template-columns": "1fr 420px", gap: "16px" }}>
      {/* Content column */}
      <div style={{ position: "relative" }}>
        <div id="container" ref={container} style={{ "line-height": 1.5, padding: "12px" }}>
          Alice <span>was</span> beginning to get <span>very</span> tired of
          sitting by her sister on the bank, and of having nothing to do: once or
          twice she had peeped into the book her sister was reading, but it had no
          pictures or conversations in it, “and what is the use of a book,”
          thought Alice “without pictures or conversations?” So she was
          considering in her own <span>mind</span> (as well as she could, for the
          hot day made her feel very sleepy and stupid), whether the pleasure of
          making a daisy-chain would be worth the trouble of getting up and
          picking the daisies, when suddenly a White Rabbit with pink eyes ran
          close by her.
          <div> Lol </div>
        </div>

        {/* Overlay: fixed so it lines up with viewport-based client rects */}
        <For each={rects()}>
          {({ rect, color, index }) => (
            <div
              style={{
                position: "fixed",
                "pointer-events": "none",
                "z-index": 9999,
                border: `2px dashed ${color}`,
                left: rect.left + "px",
                top: rect.top + "px",
                width: rect.width + "px",
                height: rect.height + "px",
                "border-radius": "6px",
                "box-shadow": `0 0 0 1px ${color}33`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-8px",
                  top: "-16px",
                  "font-family": "monospace",
                  "font-size": "11px",
                  padding: "0 4px",
                  background: color,
                  color: "white",
                  "border-radius": "3px",
                }}
              >
                #{index}
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Analysis / table column */}
      <div
        style={{
          position: "sticky",
          top: "8px",
          height: "calc(100vh - 16px)",
          overflow: "auto",
          padding: "8px",
          border: "1px solid #ddd",
          "border-radius": "8px",
          "background-color": "white",
          "box-shadow": "0 2px 12px rgba(0,0,0,0.06)",
          "font-family": "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "8px" }}>
          <strong>Rects: {rects().length}</strong>
          <button onClick={measure} style={{ padding: "6px 10px", "border-radius": "6px", border: "1px solid #ccc", "background": "#f7f7f7", cursor: "pointer" }}>
            Re-measure
          </button>
        </div>

        {/* Lines summary */}
        <div style={{ "margin-bottom": "12px" }}>
          <div style={{ "font-weight": 600, "margin-bottom": "6px" }}>Lines ({lines().length})</div>
          <For each={lines()}>
            {(L) => (
              <div style={{ "font-family": "monospace", "font-size": "12px", "margin-bottom": "4px" }}>
                Line {L.index}: top={fmt(L.top)}, left={fmt(L.left)}, right={fmt(L.right)}, height={fmt(L.height)} · rects=[{L.rects.map(r => r.index).join(", ")}]
              </div>
            )}
          </For>
        </div>

        {/* Full rects table */}
        <div style={{ "font-weight": 600, "margin-bottom": "6px" }}>All rects</div>
        <div style={{ overflow: "auto", "max-height": "60vh", border: "1px solid #eee", "border-radius": "6px" }}>
          <table style={{ width: "100%", "border-collapse": "collapse", "font-family": "monospace", "font-size": "12px" }}>
            <thead style={{ position: "sticky", top: 0, background: "#fafafa" }}>
              <tr>
                <th style={th}>#</th>
                <th style={th}>x</th>
                <th style={th}>y</th>
                <th style={th}>left</th>
                <th style={th}>top</th>
                <th style={th}>right</th>
                <th style={th}>bottom</th>
                <th style={th}>width</th>
                <th style={th}>height</th>
                <th style={th}>color</th>
              </tr>
            </thead>
            <tbody>
              <For each={rects()}>
                {({ index, rect, color }) => (
                  <tr>
                    <td style={td}>{index}</td>
                    <td style={td}>{fmt(rect.x)}</td>
                    <td style={td}>{fmt(rect.y)}</td>
                    <td style={td}>{fmt(rect.left)}</td>
                    <td style={td}>{fmt(rect.top)}</td>
                    <td style={td}>{fmt(rect.right)}</td>
                    <td style={td}>{fmt(rect.bottom)}</td>
                    <td style={td}>{fmt(rect.width)}</td>
                    <td style={td}>{fmt(rect.height)}</td>
                    <td style={{ ...td }}>
                      <span
                        title={color}
                        style={{
                          display: "inline-block",
                          width: "14px",
                          height: "14px",
                          "vertical-align": "middle",
                          "border-radius": "3px",
                          "background": color,
                          "box-shadow": "0 0 0 1px rgba(0,0,0,.15) inset",
                        }}
                      />
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        <p style={{ "font-size": "12px", color: "#666", "margin-top": "8px" }}>
          * Rects are viewport coordinates from <code>Range#getClientRects()</code>. Overlay uses <code>position: fixed</code> to match.
          Grouping tolerance: ±{EPS}px on <code>top</code>.
        </p>
      </div>
    </div>
  );
}

const th: JSX.CSSProperties = {
  textAlign: "right",
  padding: "6px 8px",
  borderBottom: "1px solid #eee",
  position: "sticky",
  top: 0,
};

const td: JSX.CSSProperties = {
  textAlign: "right",
  padding: "4px 8px",
  borderBottom: "1px dashed #eee",
};

render(() => <Counter />, document.getElementById("app")!);
