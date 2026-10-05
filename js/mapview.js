// Carte zoomable : molette, pincement, glisser, boutons. Les pins gardent une taille constante.
// Structure attendue : <div class="map"><div class="mapin"><img ...>[pins]</div></div>
const saved = {};

export function initMap(box, { onTap } = {}) {
  const stage = box.querySelector(".mapin"), img = stage.querySelector("img");
  const key = box.id || "map";
  let s = 1, x = 0, y = 0, min = 1, max = 6, W = 0, H = 0, moved = 0, drag = null, pinch = null;
  const ptrs = new Map();

  const apply = () => {
    const sw = W * s, sh = H * s, cw = box.clientWidth, ch = box.clientHeight;
    x = sw <= cw ? (cw - sw) / 2 : Math.min(0, Math.max(cw - sw, x));
    y = sh <= ch ? (ch - sh) / 2 : Math.min(0, Math.max(ch - sh, y));
    stage.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    stage.style.setProperty("--inv", 1 / s);
    saved[key] = { s, x, y };
  };
  const zoomAt = (px, py, ns) => {
    ns = Math.min(max, Math.max(min, ns));
    x = px - (px - x) * (ns / s); y = py - (py - y) * (ns / s); s = ns; apply();
  };
  const fit = () => {
    W = box.clientWidth; H = W * (img.naturalHeight / img.naturalWidth || 1);
    box.style.height = Math.min(H, Math.round(window.innerHeight * 0.78)) + "px";
    min = Math.min(1, box.clientHeight / H);
    max = Math.max(4, min * 8);
    const p = saved[key];
    if (p) { s = Math.max(min, p.s); x = p.x; y = p.y; } else { s = min; x = 0; y = 0; }
    apply();
  };

  if (img.complete && img.naturalWidth) fit(); else img.addEventListener("load", fit, { once: true });
  window.addEventListener("resize", () => { if (img.naturalWidth && document.body.contains(box)) fit(); });

  box.addEventListener("wheel", e => {
    e.preventDefault();
    const r = box.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, s * Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });

  box.addEventListener("pointerdown", e => {
    if (e.target.closest(".pin, .mapctl")) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { drag = { x: e.clientX, y: e.clientY, ox: x, oy: y }; moved = 0; }
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s }; drag = null; moved = 99;
    }
  });
  const move = e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && ptrs.size >= 2) {
      const [a, b] = [...ptrs.values()], r = box.getBoundingClientRect();
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d);
    } else if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      moved = Math.max(moved, Math.hypot(dx, dy));
      if (moved > 5) { x = drag.ox + dx; y = drag.oy + dy; apply(); }
    }
  };
  const up = e => {
    if (!ptrs.has(e.pointerId)) return;
    const tap = ptrs.size === 1 && drag && moved <= 5 && e.type === "pointerup";
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (ptrs.size === 0) drag = null;
    if (tap && onTap) {
      const r = img.getBoundingClientRect();
      onTap(+(((e.clientX - r.left) / r.width) * 100).toFixed(2), +(((e.clientY - r.top) / r.height) * 100).toFixed(2));
    }
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);

  const ctl = document.createElement("div");
  ctl.className = "mapctl";
  ctl.innerHTML = '<button type="button" data-z="in" aria-label="Zoom avant">+</button><button type="button" data-z="out" aria-label="Zoom arrière">−</button><button type="button" data-z="reset" aria-label="Recentrer">⤢</button>';
  ctl.onclick = e => {
    const z = e.target.dataset.z; if (!z) return;
    if (z === "reset") { delete saved[key]; s = min; x = 0; y = 0; return apply(); }
    zoomAt(box.clientWidth / 2, box.clientHeight / 2, s * (z === "in" ? 1.5 : 1 / 1.5));
  };
  box.appendChild(ctl);
}
