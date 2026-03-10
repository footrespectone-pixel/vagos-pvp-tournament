# 🟡 VAGOS PVP TOURNAMENT — Live Edition

Interactive 1v1 bracket tournament with **real-time Firebase sync**.  
Hosted by **AguerroX9** • Live on [kick.com/aguerrox9](https://kick.com/aguerrox9)

## ✨ Features

- **Real-time sync** — All viewers see updates instantly
- **Admin panel** — Add/remove players, generate bracket, mark winners
- **Dynamic roster** — Players can be added/removed anytime before the bracket starts
- **Spectator mode** — Viewers watch the bracket update live
- **3-day calendar** — Auto-generated match schedule

---

## 🔥 Setup Firebase (5 min, GRATUIT)

### 1. Créer un projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com/)
2. Clique **"Create a project"** (ou "Ajouter un projet")
3. Nom : `vagos-pvp` → Continue
4. Désactive Google Analytics (pas besoin) → Create Project

### 2. Ajouter une app Web

1. Sur la page du projet, clique l'icône **Web** `</>`
2. Nom : `vagos-pvp-web`
3. **Coche PAS** "Firebase Hosting" (on utilise Vercel)
4. Clique **Register App**
5. Tu verras un bloc `firebaseConfig` — **copie les valeurs**

### 3. Activer Realtime Database

1. Menu gauche → **Build** → **Realtime Database**
2. Clique **Create Database**
3. Choisis la région la plus proche (europe-west1)
4. Sélectionne **"Start in test mode"** → Enable
5. **Copie l'URL de la database** (ex: `https://vagos-pvp-default-rtdb.europe-west1.firebasedatabase.app`)

### 4. Configurer le projet

Ouvre `src/firebase.js` et remplace les valeurs :

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // depuis l'étape 2
  authDomain: "vagos-pvp.firebaseapp.com",
  databaseURL: "https://vagos-pvp-default-rtdb.europe-west1.firebasedatabase.app",  // depuis l'étape 3
  projectId: "vagos-pvp",
  storageBucket: "vagos-pvp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 5. Sécuriser la base (IMPORTANT — après les tests)

Dans Firebase Console → Realtime Database → **Rules**, remplace par :

```json
{
  "rules": {
    "tournament": {
      "adminHash": {
        ".read": true,
        ".write": true
      },
      "players": {
        ".read": true,
        ".write": true
      },
      "bracket": {
        ".read": true,
        ".write": true
      },
      "config": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

> ⚠️ Pour la prod, tu peux restreindre `.write` avec une auth Firebase, mais pour un tournoi ponctuel, ça suffit.

---

## 🚀 Deploy sur Vercel

### Via GitHub (recommandé)

```bash
cd vagos-pvp
git init
git add .
git commit -m "Vagos PVP Tournament v2 - Firebase"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/vagos-pvp-tournament.git
git push -u origin main
```

1. Va sur [vercel.com](https://vercel.com) → Sign up avec GitHub
2. **Add New Project** → Import `vagos-pvp-tournament`
3. Framework : **Vite** (auto-détecté)
4. Deploy → ✅ Live sur `vagos-pvp-tournament.vercel.app`

### Via CLI (rapide)

```bash
npm i -g vercel
cd vagos-pvp
vercel
```

---

## 🎮 Comment utiliser

### En tant que Host (toi)

1. Ouvre le site → clique **🔒 ADMIN**
2. Première connexion → **choisis ton mot de passe** (il sera sauvegardé)
3. Dans le panel admin :
   - **Ajoute les joueurs** un par un
   - Clique **⚡ GENERATE BRACKET** quand la liste est prête
   - Sur l'onglet **BRACKET**, clique sur les gagnants pour avancer le tournoi
4. Tout se sync en temps réel pour les viewers !

### En tant que Viewer

1. Ouvre le lien du site
2. L'onglet **BRACKET** montre le bracket en direct
3. L'onglet **CALENDAR** montre le planning des 3 jours
4. Tout se met à jour automatiquement — pas besoin de refresh !

---

## 📁 Structure

```
vagos-pvp/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx              ← App principale + navigation
│   ├── firebase.js          ← Config Firebase (À REMPLIR)
│   ├── components/
│   │   ├── Admin.jsx        ← Panel admin (login + gestion joueurs)
│   │   ├── Bracket.jsx      ← Bracket interactif (admin = cliquable, viewer = lecture seule)
│   │   └── Calendar.jsx     ← Calendrier 3 jours
│   └── utils/
│       ├── bracket.js       ← Logique bracket/shuffle/schedule
│       └── database.js      ← Fonctions Firebase (CRUD)
```

---

## 🔗 Links

- **Stream** : [kick.com/aguerrox9](https://kick.com/aguerrox9)
- **Firebase Console** : [console.firebase.google.com](https://console.firebase.google.com)
- **Vercel** : [vercel.com](https://vercel.com)
