# Le déclin de l'Empire — site de campagne D&D

Site statique (GitHub Pages) + Firebase (base temps réel et mot de passe MJ).

## Pages
- `index.html` : carte avec pins (dates + résumé), prochaine session, personnages cliquables
- `perso.html?id=…` : fiche de personnage
- `joueur.html` : écran joueurs (ce que le MJ affiche, dernier jet, zone, gloire)
- `mj.html` : espace MJ protégé (session, scénarios, dés, monstres, carte, personnages, gloire/faveur, prochaine session)

## Mise en place
1. **Carte** : ajoute ton image dans `assets/carte.jpg`. Avatars : `assets/avatars/…` (ou URL).
2. **Firebase** (console.firebase.google.com) : crée un projet, puis
   - *Build > Firestore Database* : créer la base (mode production)
   - *Build > Authentication > Email/Password* : activer, puis ajouter **un utilisateur** (ex. ton email + ton mot de passe MJ)
   - *Paramètres du projet > Vos applications > Web* : copie la config dans `js/config.js` et mets l'email MJ dans `MJ_EMAIL`
3. **Règles Firestore** (onglet Règles), en remplaçant l'email :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function mj() { return request.auth != null && request.auth.token.email == "mj@exemple.com"; }
    match /session/mj { allow read, write: if mj(); }
    match /{path=**} { allow read: if true; allow write: if mj(); }
  }
}
```
   Les joueurs lisent tout sauf tes notes/scénarios (`session/mj`) ; seul le MJ écrit.
4. **GitHub Pages** : pousse le dossier sur un dépôt, puis *Settings > Pages > Deploy from branch (main, /root)*. Dans Firebase *Authentication > Paramètres > Domaines autorisés*, ajoute `<ton-pseudo>.github.io`.
