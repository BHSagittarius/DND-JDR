import { watchDoc, esc } from "./firebase.js";

const id = new URLSearchParams(location.search).get("id");
const AB = [["FOR", "str"], ["DEX", "dex"], ["CON", "con"], ["INT", "int"], ["SAG", "wis"], ["CHA", "cha"]];
const mod = v => { const m = Math.floor(((+v || 10) - 10) / 2); return (m >= 0 ? "+" : "") + m; };
const blk = (t, v) => v ? `<h2>${t}</h2><div class="card">${esc(v).replace(/\n/g, "<br>")}</div>` : "";

watchDoc("characters/" + id, c => {
  if (!c.name) { document.getElementById("m").innerHTML = '<p class="mut">Personnage introuvable.</p>'; return; }
  document.getElementById("m").innerHTML = `
  <div class="row"><img class="av" src="${esc(c.avatar || "")}" alt="" onerror="this.removeAttribute('src')">
  <div><h1>${esc(c.name)}</h1><div class="mut">${esc([c.race, c.cls, c.level ? "niveau " + c.level : "", c.background].filter(Boolean).join(" · "))}<br>Joueur : ${esc(c.player || "-")}</div></div></div>
  <div class="row" style="margin:14px 0">
    <div class="card stat"><div class="big">${esc(c.hp ?? "-")}</div><div class="mut">PV max</div></div>
    <div class="card stat"><div class="big">${esc(c.ac ?? "-")}</div><div class="mut">CA</div></div>
    <div class="card stat"><div class="big">${esc(c.speed ?? "-")}</div><div class="mut">Vitesse</div></div>
    <div class="card stat"><div class="big">${esc(c.prof ?? "-")}</div><div class="mut">Maîtrise</div></div></div>
  <div class="ab">${AB.map(([l, k]) => `<div>${l}<b>${esc(c[k] ?? 10)}</b>${mod(c[k])}</div>`).join("")}</div>
  ${blk("Compétences et maîtrises", c.skills)}${blk("Attaques", c.attacks)}${blk("Sorts", c.spells)}
  ${blk("Équipement", c.gear)}${blk("Traits et capacités", c.traits)}${blk("Histoire", c.story)}`;
  document.title = c.name;
});
