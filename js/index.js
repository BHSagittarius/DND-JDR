import { watchCol, watchDoc, esc } from "./firebase.js";

const $ = id => document.getElementById(id);
let pins = [], sel = null;

watchDoc("config/site", c => {
  const n = c.nextSession || {};
  $("next").innerHTML = n.date
    ? `<b>Prochaine session :</b> ${esc(new Date(n.date).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" }))}${n.note ? `<br><span class="mut">${esc(n.note)}</span>` : ""}`
    : `<b>Prochaine session :</b> <span class="mut">à définir</span>`;
});

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

watchCol("characters", l => {
  $("pcs").innerHTML = l.map(c => `<a class="card pc" href="perso.html?id=${encodeURIComponent(c.id)}">
    <img class="av" src="${esc(c.avatar || "")}" alt="" onerror="this.removeAttribute('src')">
    <div><b>${esc(c.name)}</b><br>${esc(c.cls || "")}${c.level ? " niv. " + esc(c.level) : ""}<br><span class="mut">${esc(c.player || "")}</span></div></a>`).join("")
    || '<span class="mut">Aucun personnage.</span>';
});
