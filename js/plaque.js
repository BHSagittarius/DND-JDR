// Plaques en bois gravé : fenêtre de verre rouge au centre, aimant qui coulisse sur un arc
import { PAL } from "./data.js";

let n = 0;
const P = (cx, cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
const f = x => x.toFixed(1);
const PLATE = "M40 55 Q60 22 120 28 Q165 16 210 22 Q255 16 300 28 Q360 22 380 55 Q400 80 392 115 Q400 150 380 175 Q360 208 300 202 Q255 214 210 208 Q165 214 120 202 Q60 208 40 175 Q20 150 28 115 Q20 80 40 55 Z";

// pos : 0 (bas de l'arc) à 1 (haut) ; marks : positions des crans ; tiles : 2 tuiles de verre
export function plaque({ title, sub, tiles, pos, marks = [], label }) {
  const k = "p" + (++n), R = 88, LC = [170, 115], RC = [250, 115];
  const lp = t => P(LC[0], LC[1], R, 120 + 120 * t);
  const [x0, y0] = lp(0), [x1, y1] = lp(1);
  const [a0, b0] = P(RC[0], RC[1], R, -60), [a1, b1] = P(RC[0], RC[1], R, 60);
  const lpath = `M${f(x0)} ${f(y0)} A${R} ${R} 0 0 1 ${f(x1)} ${f(y1)}`;
  const rpath = `M${f(a0)} ${f(b0)} A${R} ${R} 0 0 1 ${f(a1)} ${f(b1)}`;
  const [mx, my] = lp(Math.max(0, Math.min(1, pos)));
  const ticks = marks.map(t => { const [x, y] = lp(t); return `<circle cx="${f(x)}" cy="${f(y)}" r="2.4" fill="#f6c453" opacity=".75"/>`; }).join("");
  const serif = "font-family:Georgia,'Times New Roman',serif";
  const tile = (x, t) => `<rect x="${x}" y="84" width="50" height="64" rx="8" fill="url(#t${k})" stroke="#4a0606" stroke-width="1.5"/>
    <rect x="${x + 3}" y="87" width="44" height="22" rx="6" fill="#fff" opacity=".12"/>
    <text x="${x + 25}" y="131" text-anchor="middle" font-size="46" font-weight="bold" fill="#f6c453" stroke="#8a5a00" stroke-width=".6" filter="url(#glow${k})" style="${serif}">${t}</text>`;
  return `<svg class="plaque" viewBox="0 0 420 230" role="img" aria-label="${title} : ${sub} ${tiles.join("")} (${label})" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="w${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2ad72"/><stop offset=".5" stop-color="#c88c50"/><stop offset="1" stop-color="#a9743f"/></linearGradient>
<filter id="g${k}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves="3" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .2  0 0 0 0 .08  0 0 0 .9 -.3"/></filter>
<filter id="glow${k}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<linearGradient id="t${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3b3b"/><stop offset="1" stop-color="#8a0d0d"/></linearGradient>
<radialGradient id="m${k}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f2f3f5"/><stop offset=".6" stop-color="#a9adb4"/><stop offset="1" stop-color="#6d7178"/></radialGradient>
<clipPath id="c${k}"><path d="${PLATE}"/></clipPath>
</defs>
<path d="${PLATE}" transform="translate(0 5)" fill="#b01212"/>
<path d="${PLATE}" fill="url(#w${k})" stroke="#5b3517" stroke-width="2"/>
<rect width="420" height="230" filter="url(#g${k})" opacity=".55" clip-path="url(#c${k})"/>
<g fill="none" stroke="#4b2a10" stroke-width="2" opacity=".55" stroke-linecap="round">
<path d="M148 66 L112 34"/><path d="M272 66 L308 34"/><path d="M148 164 L120 200"/><path d="M272 164 L300 200"/></g>
<path d="${lpath}" fill="none" stroke="#3a0a0a" stroke-width="32" stroke-linecap="round"/>
<path d="${lpath}" fill="none" stroke="#9a1212" stroke-width="24" stroke-linecap="round"/>
<path d="${rpath}" fill="none" stroke="#3a0a0a" stroke-width="32" stroke-linecap="round"/>
<path d="${rpath}" fill="none" stroke="#9a1212" stroke-width="24" stroke-linecap="round"/>
<path id="r${k}" d="${rpath}" fill="none"/>
<text font-size="12" letter-spacing="1.5" fill="#f6c453" style="${serif};font-style:italic" dy="4"><textPath href="#r${k}" startOffset="50%" text-anchor="middle">${label}</textPath></text>
${ticks}
<circle cx="${f(mx)}" cy="${f(my)}" r="12" fill="url(#m${k})" stroke="#3b3b3b" stroke-width="1.5"/>
<circle cx="${f(mx)}" cy="${f(my)}" r="5" fill="none" stroke="#7a7e85" stroke-width="1.5"/>
<rect x="144" y="70" width="132" height="90" rx="16" fill="#2a0707" stroke="#4b2a10" stroke-width="3"/>
${tile(156, tiles[0])}${tile(214, tiles[1])}
<text x="211" y="50" text-anchor="middle" font-size="20" font-weight="bold" fill="#e9c391" opacity=".55" style="${serif}">${title}</text>
<text x="210" y="49" text-anchor="middle" font-size="20" font-weight="bold" fill="#3a2208" style="${serif}">${title}</text>
<text x="210" y="188" text-anchor="middle" font-size="11" letter-spacing="4" fill="#3a2208" style="${serif}">${sub}</text>
</svg>`;
}

export const gloirePlaque = (nom, v) => plaque({
  title: nom, sub: "GLOIRE", tiles: [v > 0 ? "+" : v < 0 ? "−" : "±", String(Math.abs(v))],
  pos: (v + 3) / 6, marks: [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1], label: PAL[v]
});

export const faveurPlaque = (nom, p) => {
  const n = p >= 9 ? 3 : p >= 5 ? 2 : p >= 2 ? 1 : 0;
  return plaque({
    title: nom, sub: "FAVEUR", tiles: [String(Math.floor(p / 10)), String(p % 10)],
    pos: p / 12, marks: [2 / 12, 5 / 12, 9 / 12], label: ["Étranger", "Éveillé", "Dévot", "Élu"][n]
  });
};
