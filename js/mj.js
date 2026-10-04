import { db, auth, MJ_EMAIL, doc, collection, addDoc, deleteDoc, getDoc, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, watchCol, watchDoc, saveDoc, esc } from "./firebase.js";
import { NAT, PAL, MOD, APO, E, Z } from "./data.js";

const $ = id => document.getElementById(id);
const R = n => 1 + Math.floor(Math.random() * n);
const D0 = () => ({ sel: [], notes: "", cfg: { nj: 4, dd: 4, dm: 4, adj: 0, dp: 4, nat: "" }, gl: [0, 0, 0, 0, 0], fv: [0, 0, 0, 0],
  z: { on: false, tour: 0, tm: 0, ph: "J", ga: 0, gm: 0, ea: 0, em: 0, res: false, obj: [], log: [] } });
let S = D0(), live = {}, pins = [], chars = [], tab = "session", pe = { id: null, x: null, y: null }, ce = null, rolls = [];
const TABS = [["session", "Session"], ["scen", "Scénarios"], ["des", "Dés"], ["mon", "Monstres"], ["carte", "Carte"], ["persos", "Personnages"], ["camp", "Gloire & faveur"], ["site", "Prochaine session"]];

/* ---------- connexion ---------- */
$("go").onclick = async () => {
  try { await signInWithEmailAndPassword(auth, MJ_EMAIL, $("pw").value); }
  catch { $("err").textContent = "Mot de passe incorrect."; }
};
$("pw").onkeydown = e => { if (e.key === "Enter") $("go").click(); };
$("out").onclick = e => { e.preventDefault(); signOut(auth); };
let started = false;
onAuthStateChanged(auth, async u => {
  const ok = u && u.email === MJ_EMAIL;
  $("login").classList.toggle("hide", !!ok); $("app").classList.toggle("hide", !ok); $("out").classList.toggle("hide", !ok);
  if (ok && !started) {
    started = true;
    const s = await getDoc(doc(db, "session", "mj")); if (s.exists()) S = Object.assign(D0(), s.data());
    watchDoc("session/live", l => live = l);
    watchCol("pins", l => { pins = l; if (tab === "carte") view(); });
    watchCol("characters", l => { chars = l; if (tab === "persos" && !ce) view(); });
    $("tabs").innerHTML = TABS.map(([k, n]) => `<button data-a="tab" data-k="${k}">${n}</button>`).join("");
    view();
  }
});

const saveS = () => saveDoc("session/mj", S);
const pushLive = p => saveDoc("session/live", p);
const pubZone = () => pushLive({ zone: { ...S.z, log: [] }, gl: S.gl });
function view() {
  document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.k === tab));
  ({ session: vSession, scen: vScen, des: vDes, mon: vMon, carte: vCarte, persos: vPersos, camp: vCamp, site: vSite })[tab]();
}

/* ---------- Session ---------- */
function vSession() {
  $("tab").innerHTML = `<h2>Diffusion aux joueurs</h2><div class="card">
  <input class="t" id="dt" placeholder="Titre" style="width:100%;margin-bottom:6px"><textarea id="dx" placeholder="Texte à afficher"></textarea>
  <div class="row" style="margin-top:6px"><button class="p" data-a="showText">Afficher le texte</button>
  <input class="t" id="du" placeholder="Image (ex : assets/maps/donjon.jpg ou URL)"><button class="p" data-a="showImg">Afficher l'image</button>
  <button data-a="clearScr">Vider l'écran</button></div>
  <div class="row" style="margin-top:6px"><label><input type="checkbox" id="sz" ${live.showZone ? "checked" : ""}> Montrer la zone</label>
  <label><input type="checkbox" id="sg" ${live.showGlory ? "checked" : ""}> Montrer la gloire</label></div></div>
  <h2>Scénarios choisis</h2><div id="sl"></div>
  <h2>Zone d'évènement</h2><div id="zt"></div>
  <h2>Notes du MJ</h2><textarea id="notes" style="min-height:120px">${esc(S.notes)}</textarea>`;
  selList(); zone();
}
function selList() {
  const l = Z.filter(z => S.sel.includes(z.c));
  $("sl").innerHTML = l.map(z => `<div class="card"><b>${z.c} · ${esc(z.n)}</b> <span class="mut">${esc(z.l)}</span>
    <div class="row" style="margin:6px 0"><button data-a="loadZ" data-c="${z.c}">Charger dans l'outil de zone</button>
    <button data-a="showZ" data-c="${z.c}">Annoncer aux joueurs</button></div>${zInfo(z)}</div>`).join("") || '<span class="mut">Aucun scénario. Choisis-les dans l\'onglet Scénarios.</span>';
}
function zInfo(z) {
  return `<p><b>Objectifs :</b> ${z.o.map(esc).join(" · ")}</p><div class="w"><table><tr><th>Nb</th><th>Ennemi</th><th>FP</th><th>PV</th><th>CA</th><th>Attaques</th></tr>${z.e.map(([k, n]) => { const m = E[k]; return `<tr><td>${n}</td><td>${esc(m[0])}</td><td>${m[1]}</td><td>${m[2]}</td><td>${m[3]}</td><td>${esc(m[4])}</td></tr>`; }).join("")}</table></div>
  <p><b>Évènement :</b> ${esc(z.ev)}<br><b>Échec :</b> ${esc(z.f)}<br><b>Indices :</b> ${esc(z.i)}</p>`;
}
function zlog(t) { S.z.log.unshift(t); }
function zone() {
  const z = S.z, c = S.cfg;
  $("zt").innerHTML = `<div class="card"><div class="row">
  <label>Joueurs <input id="c_nj" type="number" value="${c.nj}"></label><label>Dé diff. d<input id="c_dd" type="number" value="${c.dd}"></label>
  <label>Dé menace d<input id="c_dm" type="number" value="${c.dm}"></label><label>Ajust. ennemis <input id="c_adj" type="number" value="${c.adj}"></label>
  <label>Précision d<input id="c_dp" type="number" value="${c.dp}"></label>+2
  <label>Nation <select id="c_nat"><option value="">Aucune</option>${NAT.map((n, i) => `<option value="${i}"${c.nat === String(i) ? " selected" : ""}>${n} (${S.gl[i] > 0 ? "+" : ""}${S.gl[i]})</option>`).join("")}</select></label></div>
  <div class="row" style="margin-top:8px"><button class="p" data-a="zStart">Lancer la zone</button><button data-a="zReset">Réinitialiser</button></div></div>
  <div class="card"><div class="row" style="justify-content:space-around">
  <div class="stat"><div class="big">${z.on ? z.tour + "/" + z.tm : "-"}</div><div class="mut">Tour</div></div>
  <div class="stat"><div class="big">${z.on ? (z.ph === "J" ? "Joueurs" : "Ennemis") : "-"}</div><div class="mut">Phase</div></div>
  <div class="stat"><div class="big">${z.on ? z.ga + "/" + z.gm : "-"}</div><div class="mut">Actions groupe</div></div>
  <div class="stat"><div class="big">${z.on ? z.ea + "/" + z.em : "-"}</div><div class="mut">Actions ennemies</div></div></div>
  <div class="bar">${z.on ? Array.from({ length: z.tm }, (_, i) => `<i class="${i < z.tour ? "on" : ""}"></i>`).join("") : ""}</div>
  ${z.res ? '<div class="banner">Plus de tours : la zone se résout automatiquement.</div>' : ""}
  <div class="row" style="margin-top:8px;justify-content:center"><button data-a="zSp">−1 action groupe</button><button class="p" data-a="zEndP">Fin phase joueurs</button><button data-a="zSe">−1 action ennemie</button><button class="p" data-a="zNext">Tour suivant</button></div>
  <div class="row" style="margin-top:6px;justify-content:center"><button data-a="zPlus">+1 action (talent)</button><button data-a="zT" data-d="1">+1 tour</button><button data-a="zT" data-d="-1">−1 tour</button></div></div>
  <div class="card"><b>Objectifs</b><div class="row" style="margin:6px 0"><input class="t" id="ot" placeholder="Nouvel objectif"><label><input type="checkbox" id="oh"> caché</label><button data-a="oAdd">Ajouter</button></div>
  ${z.obj.map((o, i) => `<div class="row"><input type="checkbox" data-o="${i}"${o.d ? " checked" : ""}><span class="${o.d ? "done" : ""}">${esc(o.t)}${o.h ? " (caché)" : ""}</span><button class="x" data-a="oDel" data-i="${i}">×</button></div>`).join("") || '<span class="mut">Aucun objectif.</span>'}</div>
  <div class="card"><b>Journal</b><div class="log">${z.log.slice(0, 40).map(l => `<div>${esc(l)}</div>`).join("")}</div></div>`;
}
function readCfg() {
  const g = k => $("c_" + k).value;
  S.cfg = { nj: +g("nj") || 4, dd: +g("dd") || 4, dm: +g("dm") || 4, adj: +g("adj") || 0, dp: +g("dp") || 4, nat: g("nat") };
}

/* ---------- Scénarios ---------- */
function vScen() {
  $("tab").innerHTML = `<h2>Scénarios disponibles</h2><p class="mut">Coche ceux que tu joues à cette session.</p>` +
    Z.map(z => `<div class="card"><label><b><input type="checkbox" data-s="${z.c}"${S.sel.includes(z.c) ? " checked" : ""}> ${z.c} · ${esc(z.n)}</b></label>
    <span class="mut">${esc(z.l)} · ${esc(z.t)}</span>${zInfo(z)}</div>`).join("");
}

/* ---------- Dés ---------- */
function roll(expr) {
  const m = expr.replace(/\s/g, "").match(/^(\d*)d(\d+)([+-]\d+)?$/i); if (!m) return null;
  const n = +m[1] || 1, f = +m[2], b = +(m[3] || 0); if (n > 100 || f < 2) return null;
  const rs = Array.from({ length: n }, () => R(f));
  return { expr, total: rs.reduce((a, c) => a + c, 0) + b, detail: `[${rs.join(", ")}]${b ? (b > 0 ? "+" : "") + b : ""}` };
}
function vDes() {
  $("tab").innerHTML = `<h2>Lancer de dés</h2><div class="card"><div class="row">${[4, 6, 8, 10, 12, 20, 100].map(d => `<button data-a="roll" data-e="d${d}">d${d}</button>`).join("")}</div>
  <div class="row" style="margin-top:8px"><input class="t" id="re" placeholder="ex : 2d6+3" value="1d20"><button class="p" data-a="roll">Lancer</button>
  <button data-a="adv" data-m="max">Avantage</button><button data-a="adv" data-m="min">Désavantage</button>
  <label><input type="checkbox" id="rs"> Envoyer aux joueurs</label></div></div>
  <div class="card"><b>Historique</b><div id="rh"></div></div>`; rollsView();
}
const rollsView = () => { if ($("rh")) $("rh").innerHTML = rolls.map(r => `<div><b>${esc(r.expr)}</b> = <span class="dice">${r.total}</span> <span class="mut">${esc(r.detail)}</span></div>`).join(""); };
function doRoll(r) { if (!r) return alert("Expression invalide (ex : 2d6+3)"); rolls.unshift(r); rolls = rolls.slice(0, 30); rollsView(); if ($("rs")?.checked) pushLive({ roll: { ...r, who: "MJ" } }); }

/* ---------- Monstres ---------- */
function vMon() {
  $("tab").innerHTML = `<h2>Cartes de monstres</h2><input class="t" id="mf" placeholder="Filtrer…" style="width:100%"><div class="g" id="ml" style="margin-top:8px"></div>
  <h2>Monstre personnalisé</h2><div class="card"><div class="row"><input class="t" id="mn" placeholder="Nom"><input id="mfp" placeholder="FP" style="width:70px"><input id="mpv" type="number" placeholder="PV"><input id="mca" type="number" placeholder="CA"></div>
  <textarea id="ma" placeholder="Attaques et traits" style="margin:6px 0"></textarea><button class="p" data-a="showCustom">Afficher aux joueurs</button></div>`; monList();
}
function monList() {
  const q = ($("mf")?.value || "").toLowerCase();
  $("ml").innerHTML = Object.entries(E).filter(([, m]) => m[0].toLowerCase().includes(q)).map(([k, m]) => `<div class="card"><b>${esc(m[0])}</b>
    <div class="mut">FP ${m[1]} · PV ${m[2]} · CA ${m[3]}</div><p>${esc(m[4])}</p><button data-a="showMon" data-k="${k}">Afficher aux joueurs</button></div>`).join("");
}

/* ---------- Carte ---------- */
function vCarte() {
  const p = pins.find(x => x.id === pe.id) || {};
  $("tab").innerHTML = `<h2>Pins de la carte</h2><p class="mut">Clique sur la carte pour placer le pin, ou sur un pin pour le modifier.</p>
  <div class="map" id="mapm"><img src="assets/carte.jpg" alt="">${pins.map(q => `<button class="pin${q.id === pe.id ? " sel" : ""}" data-a="editPin" data-id="${q.id}" style="left:${q.x}%;top:${q.y}%" title="${esc(q.name)}"></button>`).join("")}
  ${pe.x != null ? `<span class="pin sel" style="left:${pe.x}%;top:${pe.y}%;pointer-events:none"></span>` : ""}</div>
  <div class="card"><div class="row"><input class="t" id="pn" placeholder="Nom du lieu" value="${esc(p.name)}"><label>Du <input type="date" id="pf" value="${esc(p.from)}"></label><label>au <input type="date" id="pt" value="${esc(p.to)}"></label></div>
  <textarea id="ps" placeholder="Résumé de ce qui s'est passé ici" style="margin:6px 0">${esc(p.summary)}</textarea>
  <div class="row"><button class="p" data-a="savePin">Enregistrer</button><button data-a="newPin">Nouveau</button>${pe.id ? '<button class="x" data-a="delPin">Supprimer</button>' : ""}</div></div>`;
}

/* ---------- Personnages ---------- */
const CF = [["name", "Nom"], ["cls", "Classe"], ["level", "Niveau", "number"], ["player", "Joueur"], ["avatar", "Avatar (URL ou assets/avatars/x.png)"], ["race", "Race"], ["background", "Historique"],
  ["hp", "PV max", "number"], ["ac", "CA", "number"], ["speed", "Vitesse"], ["prof", "Maîtrise"], ["str", "FOR", "number"], ["dex", "DEX", "number"], ["con", "CON", "number"], ["int", "INT", "number"], ["wis", "SAG", "number"], ["cha", "CHA", "number"]];
const CT = [["skills", "Compétences et maîtrises"], ["attacks", "Attaques"], ["spells", "Sorts"], ["gear", "Équipement"], ["traits", "Traits et capacités"], ["story", "Histoire"]];
function vPersos() {
  if (ce === null) {
    $("tab").innerHTML = `<h2>Personnages</h2><button class="p" data-a="editChar" data-id="">+ Nouveau personnage</button><div class="g" style="margin-top:10px">${chars.map(c => `<div class="card pc"><img class="av" src="${esc(c.avatar || "")}" alt="" onerror="this.removeAttribute('src')"><div><b>${esc(c.name)}</b><br>${esc(c.cls || "")}<br>
    <button data-a="editChar" data-id="${c.id}">Modifier</button> <a href="perso.html?id=${c.id}">Voir</a></div></div>`).join("")}</div>`;
  } else {
    const c = chars.find(x => x.id === ce) || {};
    $("tab").innerHTML = `<h2>${ce ? "Modifier" : "Nouveau"} personnage</h2><div class="card"><div class="g">${CF.map(([k, l, t]) => `<label class="mut">${l}<br><input id="f_${k}" type="${t || "text"}" value="${esc(c[k])}" style="width:100%"></label>`).join("")}</div>
    ${CT.map(([k, l]) => `<label class="mut">${l}<textarea id="f_${k}">${esc(c[k])}</textarea></label>`).join("")}
    <div class="row" style="margin-top:8px"><button class="p" data-a="saveChar">Enregistrer</button><button data-a="editChar" data-id="__none">Retour</button>${ce ? '<button class="x" data-a="delChar">Supprimer</button>' : ""}</div></div>`;
  }
}

/* ---------- Gloire & faveur ---------- */
function vCamp() {
  $("tab").innerHTML = `<h2>Gloire des nations</h2><div class="g">${NAT.map((n, i) => { const v = S.gl[i], m = MOD[v]; return `<div class="card"><b>${n}</b><div class="row"><button data-a="gl" data-i="${i}" data-d="-1">−</button><span class="big">${v > 0 ? "+" : ""}${v}</span><button data-a="gl" data-i="${i}" data-d="1">+</button><span>${PAL[v]}</span></div><div class="mut">Actions du groupe ${m > 0 ? "+" + m : m < 0 ? m : "inchangées"}</div></div>`; }).join("")}</div>
  <h2>Faveur des apôtres</h2><div class="g">${APO.map((a, i) => { const p = S.fv[i], n = p >= 9 ? 3 : p >= 5 ? 2 : p >= 2 ? 1 : 0; return `<div class="card"><b>${a[0]}</b> <span class="mut">${["Étranger", "Éveillé", "Dévot", "Élu"][n]}</span><div class="row"><button data-a="fv" data-i="${i}" data-d="-1">−</button><span class="big">${p}</span><button data-a="fv" data-i="${i}" data-d="1">+</button></div><div class="mut">${n >= 1 ? "✔" : "✘"} ${a[1]}<br>${n >= 2 ? "✔" : "✘"} ${a[2]}<br>${n >= 3 ? "✔" : "✘"} ${a[3]}</div></div>`; }).join("")}</div>`;
}

/* ---------- Prochaine session ---------- */
async function vSite() {
  const s = await getDoc(doc(db, "config", "site")), n = (s.data() || {}).nextSession || {};
  $("tab").innerHTML = `<h2>Prochaine session</h2><div class="card"><div class="row"><input type="datetime-local" id="nd" value="${esc(n.date)}"><input class="t" id="nn" placeholder="Note (lieu, thème…)" value="${esc(n.note)}"></div>
  <div class="row" style="margin-top:8px"><button class="p" data-a="saveNext">Enregistrer</button><button class="x" data-a="clearNext">Effacer la date</button></div></div>`;
}

/* ---------- actions ---------- */
const val = id => $(id).value.trim();
const A = {
  tab: d => { tab = d.k; ce = null; view(); },
  showText: () => pushLive({ display: { type: "text", title: val("dt"), text: $("dx").value } }),
  showImg: () => pushLive({ display: { type: "image", title: val("dt"), url: val("du") } }),
  clearScr: () => pushLive({ display: { type: "none" } }),
  loadZ: d => { const z = Z.find(x => x.c === d.c); S.cfg.dm = z.dm; S.z.obj = z.o.map(t => ({ t, d: false, h: false })); saveS(); pubZone(); zone(); },
  showZ: d => { const z = Z.find(x => x.c === d.c); pushLive({ display: { type: "text", title: z.n, text: z.l + "\n\n" + z.o.join("\n") } }); },
  zStart: () => {
    readCfg(); const c = S.cfg, rd = R(c.dd), rm = R(c.dm), rp = R(c.dp), m = c.nat === "" ? 0 : MOD[S.gl[+c.nat]];
    const ga = Math.max(1, c.nj + rd + m), ea = Math.max(1, c.nj + rm + c.adj), tm = rp + 2, o = S.z.obj;
    S.z = { on: true, tour: 1, tm, ph: "J", ga, gm: ga, ea, em: ea, res: false, obj: o, log: [] };
    zlog(`Difficulté d${c.dd} : ${rd}${m ? " (gloire " + (m > 0 ? "+" : "") + m + ")" : ""} → ${ga} actions. Menace d${c.dm} : ${rm} → ${ea} actions ennemies. Précision d${c.dp} : ${rp}+2 = ${tm} tours.`); zUp();
  },
  zReset: () => { S.z = { ...D0().z }; zUp(); },
  zSp: () => { if (S.z.on && S.z.ga > 0) { S.z.ga--; zUp(); } },
  zSe: () => { if (S.z.on && S.z.ea > 0) { S.z.ea--; zUp(); } },
  zEndP: () => { const z = S.z; if (!z.on || z.res) return; z.ph = "E"; zlog(`Tour ${z.tour} : phase ennemie (${z.em} actions)`); zUp(); },
  zNext: () => { const z = S.z; if (!z.on || z.res) return; if (z.tour >= z.tm) { z.res = true; zlog("Dernier tour terminé : la zone se résout."); } else { z.tour++; z.ph = "J"; z.ga = z.gm; z.ea = z.em; zlog(`Tour ${z.tour} : phase joueurs (${z.gm} actions)`); } zUp(); },
  zPlus: () => { if (S.z.on) { S.z.ga++; zlog("Talent : +1 action"); zUp(); } },
  zT: d => { const z = S.z; if (!z.on) return; if (+d.d < 0 && z.tm <= z.tour) return; z.tm += +d.d; z.res = false; zlog(`${+d.d > 0 ? "+1" : "−1"} tour (${z.tm})`); zUp(); },
  oAdd: () => { const t = val("ot"); if (!t) return; S.z.obj.push({ t, d: false, h: $("oh").checked }); zUp(); },
  oDel: d => { S.z.obj.splice(+d.i, 1); zUp(); },
  roll: d => doRoll(roll(d.e || $("re").value)),
  adv: d => { const a = R(20), b = R(20), t = d.m === "max" ? Math.max(a, b) : Math.min(a, b); doRoll({ expr: d.m === "max" ? "d20 avantage" : "d20 désavantage", total: t, detail: `[${a}, ${b}]` }); },
  showMon: d => { const m = E[d.k]; pushLive({ display: { type: "monster", m: { name: m[0], fp: m[1], pv: m[2], ca: m[3], att: m[4] } } }); },
  showCustom: () => pushLive({ display: { type: "monster", m: { name: val("mn"), fp: val("mfp"), pv: val("mpv"), ca: val("mca"), att: $("ma").value } } }),
  editPin: d => { const p = pins.find(x => x.id === d.id); pe = { id: d.id, x: p.x, y: p.y }; vCarte(); },
  newPin: () => { pe = { id: null, x: null, y: null }; vCarte(); },
  savePin: async () => {
    if (pe.x == null) return alert("Clique d'abord sur la carte pour placer le pin.");
    const data = { name: val("pn"), from: $("pf").value, to: $("pt").value, summary: $("ps").value, x: pe.x, y: pe.y };
    if (pe.id) await saveDoc("pins/" + pe.id, data); else { const r = await addDoc(collection(db, "pins"), data); pe.id = r.id; }
  },
  delPin: async () => { if (confirm("Supprimer ce pin ?")) { await deleteDoc(doc(db, "pins", pe.id)); pe = { id: null, x: null, y: null }; } },
  editChar: d => { ce = d.id === "__none" ? null : d.id; vPersos(); },
  saveChar: async () => {
    const data = {}; [...CF, ...CT].forEach(([k, , t]) => { const v = $("f_" + k).value; data[k] = t === "number" && v !== "" ? +v : v; });
    if (!data.name) return alert("Nom requis.");
    if (ce) await saveDoc("characters/" + ce, data); else await addDoc(collection(db, "characters"), data);
    ce = null; vPersos();
  },
  delChar: async () => { if (confirm("Supprimer ce personnage ?")) { await deleteDoc(doc(db, "characters", ce)); ce = null; vPersos(); } },
  gl: d => { S.gl[+d.i] = Math.max(-3, Math.min(3, S.gl[+d.i] + +d.d)); saveS(); pubZone(); vCamp(); },
  fv: d => { S.fv[+d.i] = Math.max(0, Math.min(12, S.fv[+d.i] + +d.d)); saveS(); vCamp(); },
  saveNext: () => saveDoc("config/site", { nextSession: { date: $("nd").value, note: val("nn") } }),
  clearNext: () => { saveDoc("config/site", { nextSession: { date: "", note: "" } }); vSite(); }
};
function zUp() { saveS(); pubZone(); zone(); }
document.addEventListener("click", e => {
  const b = e.target.closest("[data-a]");
  if (b) return A[b.dataset.a]?.(b.dataset);
  const m = e.target.closest("#mapm");
  if (m && e.target.tagName === "IMG") {
    const r = e.target.getBoundingClientRect();
    pe.x = +(((e.clientX - r.left) / r.width) * 100).toFixed(2); pe.y = +(((e.clientY - r.top) / r.height) * 100).toFixed(2);
    const keep = { n: $("pn").value, f: $("pf").value, t: $("pt").value, s: $("ps").value }; vCarte();
    $("pn").value = keep.n; $("pf").value = keep.f; $("pt").value = keep.t; $("ps").value = keep.s;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.o !== undefined) { S.z.obj[+t.dataset.o].d = t.checked; zUp(); }
  else if (t.dataset.s) { const c = t.dataset.s; S.sel = t.checked ? [...new Set([...S.sel, c])] : S.sel.filter(x => x !== c); saveS(); }
  else if (t.id?.startsWith("c_")) { readCfg(); saveS(); }
  else if (t.id === "sz") pushLive({ showZone: t.checked });
  else if (t.id === "sg") pushLive({ showGlory: t.checked });
});
document.addEventListener("input", e => {
  if (e.target.id === "mf") monList();
  if (e.target.id === "notes") { S.notes = e.target.value; clearTimeout(window._nt); window._nt = setTimeout(saveS, 800); }
});
