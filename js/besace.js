import { watchDoc, esc } from "./firebase.js";

const $ = id => document.getElementById(id);

watchDoc("config/besace", b => {
  const g = b.gold || {}, items = b.items || [];
  $("coins").innerHTML = [["po", "or"], ["pa", "argent"], ["pc", "cuivre"]]
    .map(([k, l]) => `<div class="coin ${k}"><i></i><b>${esc(g[k] ?? 0)}</b><span class="mut">${l}</span></div>`).join("");

  const cats = [...new Set(items.map(i => i.c || "Divers"))];
  $("items").innerHTML = cats.map(c => `<h2>${esc(c)}</h2><div class="w"><table><tr><th>Objet</th><th>Qté</th><th>Détails</th></tr>
    ${items.filter(i => (i.c || "Divers") === c).map(i => `<tr><td>${esc(i.n)}</td><td>${esc(i.q)}</td><td>${esc(i.d)}</td></tr>`).join("")}</table></div>`).join("")
    || '<h2>Objets</h2><p class="mut">La besace est vide.</p>';

  $("notes").innerHTML = b.notes ? `<h2>Informations</h2><div class="card">${esc(b.notes).replace(/\n/g, "<br>")}</div>` : "";
});
