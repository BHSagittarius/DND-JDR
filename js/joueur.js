import { watchDoc, esc } from "./firebase.js";
import { NAT, PAL } from "./data.js";

const $ = id => document.getElementById(id);

watchDoc("session/live", s => {
  const d = s.display || { type: "none" };
  let h = '<span class="mut">En attente du MJ…</span>';
  if (d.type === "text") h = `<div><h2 style="border:0">${esc(d.title || "")}</h2><div class="txt">${esc(d.text || "")}</div></div>`;
  if (d.type === "image") h = `<div>${d.title ? `<h2 style="border:0">${esc(d.title)}</h2>` : ""}<img src="${esc(d.url)}" alt=""></div>`;
  if (d.type === "monster") {
    const m = d.m || {};
    h = `<div style="text-align:left;max-width:560px"><h2 style="border:0">${esc(m.name)}</h2>
      <div class="row"><span>FP ${esc(m.fp)}</span><span>PV ${esc(m.pv)}</span><span>CA ${esc(m.ca)}</span></div>
      <p>${esc(m.att)}</p></div>`;
  }
  $("screen").innerHTML = h;

  const r = s.roll;
  $("roll").innerHTML = r ? `Dernier jet (${esc(r.who || "MJ")}) : <span class="dice">${esc(r.expr)} = ${esc(r.total)}</span> <span class="mut">${esc(r.detail || "")}</span>`
    : '<span class="mut">Aucun jet de dés.</span>';
  $("roll").classList.toggle("hide", !r);

  const z = s.zone;
  if (s.showZone && z && z.on) {
    $("zone").innerHTML = `<h2>Zone d'évènement</h2><div class="card"><div class="row" style="justify-content:space-around">
      <div class="stat"><div class="big">${z.tour}/${z.tm}</div><div class="mut">Tour</div></div>
      <div class="stat"><div class="big">${z.ph === "J" ? "Joueurs" : "Ennemis"}</div><div class="mut">Phase</div></div>
      <div class="stat"><div class="big">${z.ga}/${z.gm}</div><div class="mut">Actions du groupe</div></div></div>
      <div class="bar">${Array.from({ length: z.tm }, (_, i) => `<i class="${i < z.tour ? "on" : ""}"></i>`).join("")}</div>
      ${z.res ? '<div class="banner">Plus de tours : la zone se résout.</div>' : ""}
      ${(z.obj || []).filter(o => !o.h).map(o => `<div class="${o.d ? "done" : ""}">• ${esc(o.t)}</div>`).join("")}</div>`;
  } else $("zone").innerHTML = "";

  $("glo").innerHTML = s.showGlory && s.gl ? `<h2>Gloire des nations</h2><div class="g">${NAT.map((n, i) => `<div class="card"><b>${n}</b><br>${s.gl[i] > 0 ? "+" : ""}${s.gl[i]} · ${PAL[s.gl[i]]}</div>`).join("")}</div>` : "";
});
