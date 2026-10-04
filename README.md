# Le déclin de l'Empire — site de campagne D&D

Site statique (GitHub Pages) + Firebase (base temps réel et mot de passe MJ).

## Pages
- `index.html` : prochaine session + compte à rebours, carte (`assets/map2.jpg`) avec pins, personnages, plaques de gloire et de faveur
- `besace.html` : bourse, objets et infos du groupe
- `docs.html` : documentation pour les joueurs (`docs/monde.html`, `docs/zones.html`)
- `joueur.html` : écran de session (ce que le MJ affiche, dernier jet, zone, gloire, faveur)
- `perso.html?id=…` : fiche de personnage
- `mj.html` : espace MJ protégé (session, scénarios, dés, monstres, carte, personnages, gloire & faveur, besace, prochaine session)

## Mise en place
1. Firebase : Firestore + Authentication (Email/Mot de passe) + un utilisateur MJ. La config est dans `js/config.js`.
2. Règles Firestore (remplace l'email si besoin) :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function mj() { return request.auth != null && request.auth.token.email == "icedratox@gmail.com"; }
    match /session/mj { allow read, write: if mj(); }
    match /{path=**} { allow read: if true; allow write: if mj(); }
  }
}
```
3. GitHub Pages : Settings > Pages > Deploy from a branch (main, /root). Ajoute `<pseudo>.github.io` aux domaines autorisés (Firebase > Authentication > Paramètres).

## Notes
- La gloire et la faveur sont stockées dans `config/campagne` : publiques, modifiables par le MJ seul, conservées entre les séances.
- Tout fichier du dépôt est public (y compris `js/data.js`, qui contient les scénarios ZE-001 à 006).
