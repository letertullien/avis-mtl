# Projet 2 — Documentation technique
## Avis et alertes – Ville de Montréal (PWA)

---

## 1. Installation et démarrage

### Prérequis
- Node.js 18+
- npm

### Étapes

```bash
# 1. Cloner le dépôt
git clone <url-du-depot>
cd montreal-avis-alertes

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
# → http://localhost:5173

# 4. Build de production
npm run build

# 5. Prévisualiser le build (requis pour tester le SW et la PWA)
npm run preview
# → http://localhost:4173
```

---

## 2. Dépendances utilisées

### Installation

```bash
# Dépendances de production
npm install react react-dom react-router-dom leaflet react-leaflet

# Dépendances de développement
npm install -D vite @vitejs/plugin-react vite-plugin-pwa
```

### Tableau des dépendances

| Dépendance | Rôle |
|---|---|
| `react` | Interface utilisateur |
| `react-dom` | Rendu DOM |
| `react-router-dom` | Navigation entre pages |
| `vite` | Bundler et serveur de développement |
| `@vitejs/plugin-react` | Support JSX pour Vite |
| `vite-plugin-pwa` | Génération SW + manifeste PWA via Workbox |
| `leaflet` | Carte interactive (bonus GeoJSON) |
| `react-leaflet` | Composants React pour Leaflet |

---

## 3. Structure du projet

```
montreal-avis-alertes/
├── public/
│   ├── sw.js                          ← Service Worker manuel (documentation)
│   ├── manifest.webmanifest           ← Manifeste PWA
│   ├── robots.txt                     ← Référencement
│   ├── icons/
│   │   ├── icon-192.png               ← Icône Android 192×192
│   │   ├── icon-512.png               ← Icône Android 512×512
│   │   ├── icon-maskable-512.png      ← Icône maskable Android
│   │   └── apple-touch-icon-180.png   ← Icône iOS 180×180
│   └── screenshots/
│       ├── mobile.png                 ← Capture mobile (PWA install)
│       └── desktop.png                ← Capture desktop (PWA install)
├── src/
│   ├── main.jsx                       ← Point d'entrée + enregistrement SW
│   ├── App.jsx                        ← Routes de l'application
│   ├── index.css                      ← Styles globaux
│   ├── services/
│   │   ├── alertes.js                 ← Appels API + mapping + GeoJSON
│   │   └── listes.js                  ← Liste arrondissements + getSujets()
│   ├── utils/
│   │   └── Normaliser.js              ← Normalisation pour recherche sans accents
│   ├── components/
│   │   ├── CarteAlerte/               ← Carte d'une alerte dans la liste
│   │   ├── CarteAlerteDetail/         ← Carte Leaflet (bonus GeoJSON)
│   │   ├── BandeauHorsLigne/          ← Indicateur mode hors-ligne
│   │   ├── Chargement/                ← Spinner de chargement
│   │   ├── Abonnement/                ← Encart S'abonner
│   │   ├── Entete/                    ← En-tête partagée
│   │   ├── Layout/                    ← Mise en page commune
│   │   └── PiedDePage/                ← Pied de page
│   └── pages/
│       ├── Accueil/                   ← Liste alertes + filtres + recherche
│       │   ├── filtre/                ← Composant Filtre (boutons multi-sélection)
│       │   └── BoutonSupprimer/       ← Bouton Tout effacer
│       ├── DetailAlerte/              ← Page de détail + carte
│       └── PageIntrouvable/           ← Page 404
├── index.html                         ← HTML principal + manifeste + balises Apple
└── vite.config.js                     ← Configuration Vite + vite-plugin-pwa
```

---

## 4. Preuves de réalisation

### 4.1 Données réelles — API de la Ville de Montréal

**Fichier :** `src/services/alertes.js`

```javascript
const API_URL =
  "https://donnees.montreal.ca/api/3/action/datastore_search" +
  "?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336";

export async function getAlertes(offset = 0, limite = 10) {
  const url = `${API_URL}&limit=${limite}&offset=${offset}`;
  const reponse = await fetch(url);
  const json = await reponse.json();
  const alertes = json.result.records.map(mapperAlerte);
  const total = json.result.total;
  return { alertes, total };
}
```

### 4.2 Normalisation (mapping API → modèle interne)

**Fichier :** `src/services/alertes.js`

```javascript
function mapperAlerte(enreg) {
  return {
    id: String(enreg._id),
    titre: enreg.titre ?? "",
    arrondissement: extraireArrondissement(enreg.titre ?? ""),
    sujet: enreg.type ?? "Autre",
    dateEmission: enreg.date_debut ? enreg.date_debut.slice(0, 10) : "",
    dateFin: enreg.date_fin ? enreg.date_fin.slice(0, 10) : "",
    lien: enreg.lien ?? "",
  };
}
```

| Champ API | Champ interne | Transformation |
|---|---|---|
| `_id` | `id` | Converti en string |
| `titre` | `titre` | Direct |
| *(absent)* | `arrondissement` | Extrait du titre par liste fixe + normalisation |
| `type` | `sujet` | Direct |
| `date_debut` | `dateEmission` | Tronqué à 10 caractères (YYYY-MM-DD) |
| `date_fin` | `dateFin` | Tronqué à 10 caractères (YYYY-MM-DD) |
| `lien` | `lien` | Direct |

### 4.3 États de chargement et d'erreur

**Fichier :** `src/pages/Accueil/Accueil.jsx`

```javascript
if (chargement) {
  return <Chargement />;
}

if (erreur) {
  return (
    <div className={styles.page}>
      <p className={styles.erreur}>
        Impossible de charger les alertes. Vérifiez votre connexion.
      </p>
    </div>
  );
}
```

### 4.4 Filtres multi-valeurs avec chips

**Fichier :** `src/pages/Accueil/filtre/Filtre.jsx`

```javascript
// Boutons toggle multi-sélection
function toggleArrondissement(valeur) {
  setFiltresArrondissement((prev) =>
    prev.includes(valeur)
      ? prev.filter((a) => a !== valeur)  // retire si déjà sélectionné
      : [...prev, valeur]                  // ajoute sinon
  );
}
```

```jsx
// Zone chips filtres actifs
{aFiltresActifs && (
  <div className={styles.filtresActifs}>
    {filtresArrondissement.map((a) => (
      <span key={a} className={styles.chip}>
        {a}
        <button onClick={() => retirerArrondissement(a)} aria-label={`Retirer le filtre ${a}`}>×</button>
      </span>
    ))}
  </div>
)}
```

**Logique ET/OU :** `src/pages/Accueil/Accueil.jsx`

```javascript
// OU à l'intérieur d'un filtre
const arrondissementOk =
  filtresArrondissement.length === 0 ||
  filtresArrondissement.includes(alerte.arrondissement);

// ET entre filtres
return rechercheOk && arrondissementOk && sujetOk && dateDebutOk && dateFinOk;
```

### 4.5 Manifest PWA

**Fichier :** `public/manifest.webmanifest`

```json
{
  "name": "Avis et alertes Montréal",
  "short_name": "Avis MTL",
  "description": "Consultez les avis et alertes de la Ville de Montréal",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "purpose": "maskable" }
  ]
}
```

Icône Apple Touch dans `index.html` :
```html
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
```

### 4.6 Service Worker — Stratégies de cache

**Fichier :** `vite.config.js`

```javascript
workbox: {
  // Assets statiques précachés au premier chargement
  globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],

  // API Ville → Stale-While-Revalidate
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/donnees\.montreal\.ca\/api\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-avis-mtl',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 86400, // 24 heures
        },
      },
    },
  ],
},
```

| Ressource | Stratégie | Justification |
|---|---|---|
| Assets statiques (JS, CSS, HTML, images) | **Cache First** via précache | Fichiers qui ne changent pas entre les visites |
| API Ville (`donnees.montreal.ca`) | **Stale-While-Revalidate** | Affichage immédiat depuis le cache + mise à jour en arrière-plan |

### 4.7 Mode hors-ligne — Bandeau indicateur

**Fichier :** `src/components/BandeauHorsLigne/BandeauHorsLigne.jsx`

```javascript
function BandeauHorsLigne() {
  const [horsLigne, setHorsLigne] = useState(!navigator.onLine);

  useEffect(() => {
    window.addEventListener("online",  () => setHorsLigne(false));
    window.addEventListener("offline", () => setHorsLigne(true));
  }, []);

  if (!horsLigne) return null;

  return (
    <div className={styles.bandeau} role="alert">
      Vous êtes hors connexion. Les dernières alertes téléchargées sont affichées.
    </div>
  );
}
```

### 4.8 Bonus — Carte GeoJSON (Leaflet)

**Fichier :** `src/services/alertes.js`

```javascript
const GEOJSON_URL = "https://donnees.montreal.ca/dataset/.../avis-alertes.geojson";

export async function getGeometrieByTitre(titre) {
  const reponse = await fetch(GEOJSON_URL);
  const geojson = await reponse.json();
  const feature = geojson.features.find((f) => f.properties.titre === titre);
  if (!feature) return null;
  return feature.geometry;
}
```

**Fichier :** `src/components/CarteAlerteDetail/CarteAlerteDetail.jsx`

- Affiche un `<Marker>` pour les alertes de type `Point`
- Affiche un `<Polyline>` pour les alertes de type `LineString` (tracé de rue)
- Vérifie la validité des coordonnées (rejette `[0, 0]`)

---

## 5. Scores Lighthouse (production — navigation privée)

| Catégorie | Score |
|---|---|
| **Performances** | 97 |
| **Accessibilité** | 100 |
| **Bonnes pratiques** | 100 |
| **SEO** | 100 |

> Testé sur `npm run preview` (`localhost:4173`) en mode navigation privée, émulation Moto G Power, connexion 4G lente.


















// ── Manifeste PWA — public/manifest.webmanifest ───────────────────────────
// Ce fichier définit les métadonnées de l'application installable
// Il est lu par le navigateur quand l'utilisateur installe la PWA

{
  // Identifiant unique de l'app — si absent, start_url est utilisé à la place
  "id": "/",

  // Nom complet affiché lors de l'installation et dans le gestionnaire d'apps
  "name": "Avis et alertes Montréal",

  // Nom court affiché sur l'écran d'accueil (limité en espace)
  "short_name": "Avis MTL",

  // Description affichée dans la fiche d'installation enrichie
  "description": "Consultez les avis et alertes de la Ville de Montréal",

  // Page ouverte au lancement de l'app installée
  "start_url": "/",

  // Périmètre du Service Worker — toutes les URLs du site sont couvertes
  "scope": "/",

  // S'ouvre comme une app native, sans barre d'adresse du navigateur
  "display": "standalone",

  // Orientation par défaut au lancement
  "orientation": "portrait",

  // Couleur du splash screen pendant le chargement initial
  "background_color": "#ffffff",

  // Couleur de la barre de statut sur Android et de l'onglet sur desktop
  "theme_color": "#1a1a2e",

  // Langue de l'application
  "lang": "fr-CA",

  // ── Icônes ───────────────────────────────────────────────────────────────
  // Requises pour l'installation sur Android, iOS et desktop
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"        // icône standard utilisée partout
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"        // icône haute résolution pour les grands écrans
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"   // icône adaptative — Android peut la découper en cercle ou carré
    }
  ],

  // ── Captures d'écran ─────────────────────────────────────────────────────
  // Affichées dans la fiche d'installation enrichie sur Android Chrome et Edge
  // Permettent à l'utilisateur de prévisualiser l'app avant de l'installer
  "screenshots": [
    {
      "src": "/screenshots/mobile.png",
      "sizes": "1170x2531",
      "type": "image/png",
      "form_factor": "narrow",                  // capture mobile (portrait)
      "label": "Page d'accueil sur mobile"
    },
    {
      "src": "/screenshots/desktop.png",
      "sizes": "2560x1600",
      "type": "image/png",
      "form_factor": "wide",                    // capture desktop (paysage)
      "label": "Page d'accueil sur ordinateur"
    }
  ]
}











                              SW

 
// Ex: passer "v1" à "v2" force le SW à recréer le cache avec les nouveaux fichiers
const CACHE_STATIQUE = "avis-mtl-statique-v3";  // pour les assets JS, CSS, HTML, images
const CACHE_API      = "avis-mtl-api-v3";       // pour les réponses de l'API de la Ville

// ── Ressources à précacher à l'installation ───────────────────────────────
const ASSETS = [
  "/",                       // page d'accueil
  "/index.html",             // fichier HTML principal
  "/manifest.webmanifest",   // manifeste de la PWA
];

// ── Événement install ─────────────────────────────────────────────────────
// Déclenché une seule fois quand le SW est installé pour la première fois
// ou quand son fichier a changé (nouvelle version détectée par le navigateur)
self.addEventListener("install", (event) => {

  // waitUntil empêche le SW de passer à l'étape suivante
  // tant que le précache n'est pas terminé
  event.waitUntil(
    // Ouvre (ou crée) le cache statique et y ajoute tous les ASSETS d'un coup
    caches.open(CACHE_STATIQUE).then((cache) => cache.addAll(ASSETS))
  );

  // Force le nouveau SW à s'activer immédiatement sans attendre
  // que l'utilisateur ferme tous les onglets de l'application
  self.skipWaiting();
});

// ── Événement activate ────────────────────────────────────────────────────
// Déclenché après install, quand le SW prend le contrôle des pages
// C'est ici qu'on nettoie les anciens caches des versions précédentes
self.addEventListener("activate", (event) => {

  // Liste des caches qu'on veut garder (la version actuelle seulement)
  const cachesValides = [CACHE_STATIQUE, CACHE_API];

  event.waitUntil(
    // Récupère tous les noms de caches existants dans le navigateur
    caches.keys().then((clefs) =>
      Promise.all(
        clefs
          // Garde seulement les caches qui ne sont PAS dans cachesValides
          // = les anciens caches des versions précédentes
          .filter((c) => !cachesValides.includes(c))
          // Supprime chacun d'eux
          .map((c) => caches.delete(c))
      )
    )
  );

  // Permet au SW activé de prendre immédiatement le contrôle
  // de toutes les pages ouvertes sans attendre un rechargement
  self.clients.claim();
});

// ── Événement fetch ───────────────────────────────────────────────────────
// Déclenché à chaque requête réseau faite par l'application
// C'est ici qu'on décide quelle stratégie de cache appliquer
self.addEventListener("fetch", (event) => {

  // Le cache ne supporte que GET — on laisse passer POST/PUT/DELETE sans les intercepter
  // sinon le navigateur lancerait une erreur en tentant de les mettre en cache
  if (event.request.method !== "GET") return;

  // Ignore les requêtes des extensions Chrome (scheme "chrome-extension://")
  // qui ne peuvent pas être mises en cache
  if (!event.request.url.startsWith("http")) return;

  // Décompose l'URL pour lire le hostname
  // Ex: "https://donnees.montreal.ca/api/..." → hostname = "donnees.montreal.ca"
  const url = new URL(event.request.url);

  // API de la Ville → Stale-While-Revalidate
  // Retourne le cache immédiatement + met à jour en arrière-plan
  if (url.hostname === "donnees.montreal.ca") {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_API));
    return;  // on arrête ici, pas besoin d'aller plus loin
  }

  // Tout le reste (JS, CSS, images, HTML) → Cache First
  // Répond depuis le cache si disponible, sinon va sur le réseau
  event.respondWith(cacheFirst(event.request, CACHE_STATIQUE));
});

// ── Stratégie Cache First ─────────────────────────────────────────────────
// Priorité au cache — le réseau n'est utilisé qu'en dernier recours
// Idéal pour les assets statiques qui ne changent pas souvent
async function cacheFirst(requete, nomCache) {
  const cache  = await caches.open(nomCache);

  // Cherche la requête dans le cache
  const cached = await cache.match(requete);

  // Si trouvé en cache → retourne directement sans appel réseau (instantané)
  if (cached) return cached;

  // Pas en cache → va chercher sur le réseau
  const reponse = await fetch(requete);

  // Si la réponse est valide (pas une erreur 404, 500, etc.)
  // reponse.clone() est nécessaire car une réponse ne peut être lue qu'une seule fois
  if (reponse.ok) {
    cache.put(requete, reponse.clone());
  }

  return reponse;
}

// ── Stratégie Stale-While-Revalidate ─────────────────────────────────────
// Retourne le cache immédiatement (rapide) ET met à jour en arrière-plan (frais)
// Idéal pour les données API qui changent régulièrement
async function staleWhileRevalidate(requete, nomCache) {
  const cache = await caches.open(nomCache);

  // Cherche la version en cache (peut être ancienne = "stale")
  const cached = await cache.match(requete);

  // Lance la requête réseau en parallèle sans bloquer
  // Quand elle arrive, elle met à jour le cache silencieusement en arrière-plan
  const reseauPromesse = fetch(requete).then((reponse) => {

    // Met à jour le cache avec la version fraîche du réseau
    if (reponse.ok) {
      cache.put(requete, reponse.clone());
    }
    return reponse;
  });

  // Si une version est en cache → la retourner immédiatement (stale)
  // Sinon → attendre la réponse du réseau (revalidate)
  return cached || reseauPromesse;
}