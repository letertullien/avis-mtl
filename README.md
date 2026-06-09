
# Avis et alertes Montréal — PWA Full-Stack

Application web progressive (PWA) permettant de consulter les avis et alertes
de la Ville de Montréal en temps réel, avec notifications push, mode hors-ligne
et tableau de bord administrateur.

---

## Fonctionnalités

### Application PWA (Frontend)
- Consultation des avis et alertes de la Ville de Montréal
- Recherche par mot-clé
- Filtres par arrondissement, sujet et date (dropdowns avec checkboxes)
- Pagination avec bouton "Charger plus" `bonus`
- Page de détail avec carte Leaflet et localisation géographique
- Mode hors-ligne grâce au Service Worker
- Installable sur écran d'accueil (PWA)
- Modale d'abonnement aux notifications push
- Gestion des cas : permission refusée, déjà bloquée, API indisponible
- Notification in-app quand l'application est ouverte `bonus`

### Serveur Express (Backend)
- API REST consommant les données de la Ville de Montréal
- Gestion complète des abonnements push (subscribe / unsubscribe)
- Envoi de notifications push via web-push et clés VAPID
- Suppression automatique des abonnements expirés (410/404)
- Historique des notifications envoyées en base de données `bonus`
- Dashboard administrateur `/admin` pour envoyer des notifications `bonus`

---

## Organisation du dépôt
avis-mtl/
├── backend/                  Serveur Node.js/Express
│   ├── db/
│   │   ├── abonnement.js     Modèle MongoDB — abonnements push
│   │   └── notification.js   Modèle MongoDB — historique notifications
│   ├── routes/
│   │   ├── avis.js           GET /avis-alertes
│   │   ├── subscriptions.js  GET /vapid-public-key, POST /subscribe, POST /unsubscribe
│   │   └── notifications.js  POST /send-notification, GET /notifications
│   ├── utils/
│   │   └── webpush.js        Configuration clés VAPID
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── frontend/                 Application PWA React
│   ├── public/
│   │   ├── icons/
│   │   ├── sw.js             Service Worker
│   │   └── manifest.webmanifest
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useNotifications.js
│   │   ├── pages/
│   │   │   ├── Accueil/
│   │   │   ├── DetailAlerte/
│   │   │   └── Admin/
│   │   └── services/
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   └── rapport.pdf
├── netlify.toml
└── README.md

---

## Installation et démarrage

### Prérequis
- Node.js v18+
- Compte MongoDB Atlas
- Compte Netlify (frontend)
- Compte Render (backend)

### Backend

```bash
cd backend
npm install
```

Crée un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Remplis les variables (voir section Variables d'environnement).

Lance le serveur :

```bash
npm run dev      # développement (nodemon)
npm start        # production
```

Le serveur démarre sur `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
```

Crée un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Lance l'application :

```bash
npm run dev      # développement — http://localhost:5173
npm run build    # build production
npm run preview  # prévisualisation du build — http://localhost:4173
```

### Base de données (MongoDB Atlas)

1. Crée un cluster gratuit sur [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crée un utilisateur avec le rôle **Atlas Admin**
3. Autorise toutes les IP (`0.0.0.0/0`) dans **Network Access**
4. Récupère la connection string et place-la dans `MONGODB_URI`

Les collections `abonnements` et `notifications` sont créées automatiquement
au premier démarrage.

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
PORT=
MONGODB_URI=
FRONTEND_URL=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_MAILTO=
```

### Frontend (`frontend/.env`)
Aucune variable d'environnement requise — l'URL du backend est définie
directement dans `src/services/alertes.js` et `src/hooks/useNotifications.js`.

---

## Tester l'envoi de notifications

### Étape 1 — S'abonner
1. Ouvre l'application : `https://adorable-sorbet-4875fe.netlify.app`
2. Clique sur **M'abonner** dans la section "S'abonner aux alertes"
3. Accepte la permission de notifications dans le navigateur

### Étape 2 — Option A : Dashboard admin (recommandé)
1. Va sur `https://adorable-sorbet-4875fe.netlify.app/admin`
2. Remplis les champs **Titre**, **Corps** et **URL de destination**
3. Clique **Envoyer à tous les abonnés**
4. La notification apparaît sur tous les appareils abonnés

### Étape 2 — Option B : Postman / Insomnia
Envoie une requête POST :
POST https://avis-mtl-backend.onrender.com/send-notification
Content-Type: application/json
{
"title": "Test notification",
"body": "Ceci est un test !",
"url": "/alertes/1"
}

La notification s'affiche en haut à droite de l'écran (Mac/Windows)
ou dans le centre de notifications (iPhone — app installée sur l'écran d'accueil).

---

## URLs de déploiement

| Service | URL |
|---|---|
| Frontend (Netlify) | https://adorable-sorbet-4875fe.netlify.app |
| Backend (Render) | https://avis-mtl-backend.onrender.com |
| Dashboard admin | https://adorable-sorbet-4875fe.netlify.app/admin |