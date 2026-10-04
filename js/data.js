// Données de campagne reprises de tes documents (registre des zones, outil MJ)
export const NAT = ["Empire", "Biel", "Eleica", "Ellen", "Ports libres"];
export const PAL = { "-3": "Proscrit", "-2": "Hostile", "-1": "Méfiant", "0": "Inconnu", "1": "Reconnu", "2": "Allié", "3": "Champion" };
export const MOD = { "-3": -2, "-2": -1, "-1": 0, "0": 0, "1": 0, "2": 1, "3": 2 };
export const APO = [
  ["Vaelor", "Un allié relance une sauvegarde (1/zone)", "+1 action de groupe si on défend (1/zone)", "Le décompte des tours est suspendu 1 tour (1/séance)"],
  ["Ysmène", "Stabiliser un allié à 0 PV (1/zone)", "Interroger un esprit pour un indice (1/zone)", "Un allié tombé se relève (1/séance)"],
  ["Maëlis", "Soins +1d6 (1/zone)", "Avantage discrétion en milieu naturel (1/zone)", "Racines : ennemis immobilisés 1 round (1/séance)"],
  ["Kaldrin", "Révéler un objectif caché (1/zone)", "Relancer le dé de difficulté d'une zone liée à un sceau (1/séance)", "Dissiper un phénomène magique ou renforcer un sceau (1/séance)"]
];
// [nom, FP, PV, CA, attaques]
export const E = {
  bandit: ["Assassin-recrue (Bandit)", "1/8", 11, 12, "Cimeterre +3, 1d6+1 ; arbalète légère +3, 1d8+1"],
  capt: ["Chef d'assaut (Chef de bandits)", "2", 65, 15, "3 attaques de mêlée (+5, 1d8+3) ou 2 à distance ; Parade (+2 CA en réaction)"],
  garde: ["Garde", "1/8", 11, 16, "Lance +3, 1d6+1"],
  brute: ["Brute (Voyou)", "1/2", 32, 11, "2 attaques masse +4, 1d6+2 ; avantage si allié adjacent"],
  vet: ["Vétéran", "3", 58, 17, "2 attaques épée longue +5, 1d8+3 ; arbalète lourde +3, 1d10+1"],
  cult: ["Cultiste", "1/8", 9, 12, "Cimeterre +3, 1d6+1 ; avantage aux jets contre la peur"],
  fan: ["Fanatique", "2", 33, 13, "2 attaques dague +4, 1d4+2 ; sorts : bouclier de la foi, injonction, blessure, immobilisation"],
  loup: ["Loup", "1/4", 11, 13, "Morsure +4, 2d4+2 ; tactique de meute (avantage)"],
  dire: ["Loup funeste", "1", 37, 14, "Morsure +5, 2d6+3 ; renverse (FOR DD 13)"],
  ron: ["Ronce maudite (Végétal)", "1/8", 4, 13, "Griffes +3, 1d4+1 ; camouflage dans le feuillage"],
  ara: ["Araignée géante", "1", 26, 14, "Morsure +5, 1d8+3 + poison 2d8 (CON DD 11) ; toile"],
  sq: ["Squelette", "1/4", 13, 13, "Épée courte +4, 1d6+2 ; vulnérable au contondant"],
  zom: ["Zombie", "1/4", 22, 8, "Coup +3, 1d6+1 ; Ténacité d'outre-tombe"],
  spec: ["Spectre", "1", 22, 12, "Drain de vie +4, 3d6 nécrotique ; incorporel, traverse les murs"]
};
export const Z = [
  { c: "ZE-001", n: "Les funérailles", l: "Place des Gardiens, Megano", t: "Semaine 1", dm: 4, o: ["Protéger la foule et l'estrade (principal)", "Neutraliser les agresseurs", "Fouiller la scène pour un indice"], e: [["capt", 1], ["bandit", 4]], ev: "Tour 3 : 3 renforts (Gardes retournés) depuis une ruelle", f: "Les agresseurs fuient avec un objet, des civils sont blessés", i: "Symbole inconnu, tissu des Gardiens, pièce d'Ellen" },
  { c: "ZE-002", n: "La ruelle des tisserands", l: "Quartier des artisans, Megano", t: "Semaine 1-2", dm: 4, o: ["Rattraper le fuyard", "Sauver un témoin", "Trouver la planque"], e: [["brute", 2], ["bandit", 3]], ev: "Tour 2 : effondrement d'un balcon (zone à risque)", f: "Le fuyard disparaît, le témoin est tué", i: "Piste vers le camp de Corvin ou Ellen" },
  { c: "ZE-003", n: "Le pont de Radigues", l: "Frontière de Biel, cité de Radigues", t: "Semaine 3", dm: 4, o: ["Tenir le pont", "Évacuer les civils", "Capturer un officier"], e: [["garde", 4], ["vet", 1], ["loup", 2]], ev: "Tour 4 : un second groupe traverse le gué", f: "Le pont est pris, des civils sont piégés", i: "Offres des deux camps" },
  { c: "ZE-004", n: "Le convoi de Karnak", l: "Route de Karnak", t: "Mois 1", dm: 6, o: ["Intercepter ou protéger le convoi", "Découvrir le destinataire", "Éviter les pertes"], e: [["bandit", 5], ["capt", 1], ["dire", 1]], ev: "Tour 3 : une patrouille impériale arrive (allié ou ennemi)", f: "Le convoi disparaît", i: "Lettres scellées d'Ellen, promesse de Karnak" },
  { c: "ZE-005", n: "La lisière de la forêt interdite", l: "Près de Livendia", t: "Mois 2", dm: 6, o: ["Atteindre le sceau", "Sauver des villageois", "Repousser les créatures"], e: [["ron", 6], ["ara", 2], ["spec", 1]], ev: "Tour 3 : le sceau pulse et attire de nouvelles créatures", f: "Le sceau cède et la frontière nord s'ouvre", i: "La Voix murmure un nom" },
  { c: "ZE-006", n: "Le Sentier des âmes", l: "Sentier des âmes, Eleica", t: "Mois 3-4", dm: 6, o: ["Apaiser les morts", "Protéger l'escorte", "Renforcer le sceau"], e: [["sq", 4], ["zom", 3], ["spec", 2]], ev: "Tour 4 : un esprit possède un allié (SAG DD 12)", f: "Les morts se dispersent dans les plaines", i: "Les ancêtres réclament un secret" }
];
