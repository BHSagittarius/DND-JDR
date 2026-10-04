import { watchCol, watchDoc, esc } from "./firebase.js";
import { NAT, APO } from "./data.js";
import { gloirePlaque, faveurPlaque } from "./plaque.js";

const $ = id => document.getElementById(id);
let pins = [], sel = null, target = null;

/* ---- prochaine session + compte à rebours ---- */
watchDoc("config/site", c => {
  const n = c.nextSession || {};
  target = n.date ? new Date(n.date).getTime() : null;
  $("next").innerHTML = target
    ? `<div class="mut">Prochaine session</div><div class="when">${esc(new Date(target).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" }))}</div>
       ${n.note ? `<div class="mut">${esc(n.note)}</div>` : ""}<div class="cds" id="cd"></div>`
    : `<b>Prochaine session :</b> <span class="mut">à définir</span>`;
  tick();
});
function tick() {
  const el = $("cd"); if (!el || !target) return;
  const s = Math.floor((target - Date.now()) / 1000);
  if (s <= 0) { el.innerHTML = '<div class="when">La session commence !</div>'; return; }
  const v = [[Math.floor(s / 86400), "jours"], [Math.floor(s % 86400 / 3600), "heures"], [Math.floor(s % 3600 / 60), "minutes"], [s % 60, "secondes"]];
  el.innerHTML = v.map(([x, l]) => `<div class="cd"><b>${String(x).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
}
setInterval(tick, 1000);

/* ---- carte ---- */
function drawPins() {
  document.querySelectorAll(".pin").forEach(p => p.remove());
  pins.forEach(p => {
    const b = document.createElement("button");
    b.className = "pin" + (p.id === sel ? " sel" : "");
    b.style.left = p.x + "%"; b.style.top = p.y + "%"; b.title = p.name;
    b.onclick = () => { sel = p.id; drawPins(); showPin(p); };
    $("map").appendChild(b);
  });
}
function showPin(p) {
  const d = [p.from, p.to].filter(Boolean).map(x => new Date(x).toLocaleDateString("fr-FR")).join(" → ");
  $("pinbox").innerHTML = `<h3>${esc(p.name)}</h3>${d ? `<div class="mut">Du ${esc(d)}</div>` : ""}<p>${esc(p.summary || "Pas encore de résumé.").replace(/\n/g, "<br>")}</p>`;
}
watchCol("pins", l => { pins = l; drawPins(); const p = l.find(x => x.id === sel); if (p) showPin(p); });

/* ---- personnages ---- */
watchCol("characters", l => {
  $("pcs").innerHTML = l.map(c => `<a class="card pc" href="perso.html?id=${encodeURIComponent(c.id)}">
    <img class="av" src="${esc(c.avatar || "")}" alt="" onerror="this.removeAttribute('src')">
    <div><b>${esc(c.name)}</b><br>${esc(c.cls || "")}${c.level ? " niv. " + esc(c.level) : ""}<br><span class="mut">${esc(c.player || "")}</span></div></a>`).join("")
    || '<span class="mut">Aucun personnage.</span>';
});

/* ---- gloire et faveur (conservées entre les séances) ---- */
watchDoc("config/campagne", c => {
  const gl = c.gl || [0, 0, 0, 0, 0], fv = c.fv || [0, 0, 0, 0];
  $("gl").innerHTML = NAT.map((n, i) => gloirePlaque(n, gl[i] ?? 0)).join("");
  $("fv").innerHTML = APO.map((a, i) => faveurPlaque(a[0], fv[i] ?? 0)).join("");
});
