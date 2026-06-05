# Avis et alertes – Ville de Montréal (Projet 2)

Application React transformée en PWA installable et fonctionnelle hors connexion, branchée sur les données réelles de la Ville de Montréal.

---

## Installation et démarrage

### Prérequis
- Node.js 18+
- npm

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev
# → http://localhost:5173

# 3. Build de production
npm run build

# 4. Prévisualiser le build (requis pour tester le SW et la PWA)
npm run preview
# → http://localhost:4173
```

> Le Service Worker et le mode hors-ligne ne fonctionnent qu'en mode preview (`npm run preview`), pas en développement.

---

## Données — API de la Ville de Montréal

Les données proviennent du portail de données ouvertes :

```
https://donnees.montreal.ca/api/3/action/datastore_search
  ?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336
```

### Particularités

- **Pas de champ arrondissement** dans l'API — extrait du titre via une liste fixe des 18 arrondissements officiels avec normalisation des tirets et accents.
- **Pas de description** — un lien vers `montreal.ca` remplace le contenu complet.
- **GeoJSON** (bonus) — coordonnées GPS récupérées depuis un second endpoint pour afficher la carte.

### Mapping API → modèle interne

| Champ API | Champ interne | Transformation |
|---|---|---|
| `_id` | `id` | Converti en string |
| `titre` | `titre` | Direct |
| *(absent)* | `arrondissement` | Extrait du titre par liste fixe |
| `type` | `sujet` | Direct |
| `date_debut` | `dateEmission` | Tronqué à 10 caractères (YYYY-MM-DD) |
| `date_fin` | `dateFin` | Tronqué à 10 caractères (YYYY-MM-DD) |
| `lien` | `lien` | Direct |

---

## Stratégie de mise en cache

| Ressource | Stratégie | Justification |
|---|---|---|
| Assets statiques (JS, CSS, HTML, images) | **Cache First** (précache Workbox) | Ces fichiers ne changent pas entre les visites — répondre depuis le cache est instantané et permet le démarrage hors-ligne |
| API Ville de Montréal (`donnees.montreal.ca`) | **Stale-While-Revalidate** | L'utilisateur voit les données immédiatement depuis le cache, pendant que le SW récupère une version fraîche en arrière-plan |

Configuré dans `vite.config.js` via `vite-plugin-pwa` (Workbox) :

```javascript
workbox: {
  globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/donnees\.montreal\.ca\/api\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-avis-mtl',
        expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
      },
    },
  ],
},
```

---

## Mode hors-ligne

- Le shell applicatif (HTML, JS, CSS) est précaché à l'installation du SW
- Les dernières alertes téléchargées restent consultables
- La navigation entre l'accueil et la page de détail fonctionne
- Un bandeau jaune informe l'utilisateur qu'il est hors connexion

Pour tester : DevTools → Application → Service Workers → cocher **Offline** → recharger la page.

---

## Fonctionnalités

- **Données réelles** — API de la Ville de Montréal
- **Filtres multi-valeurs** — arrondissement et sujet (combinaison OU à l'intérieur, ET entre filtres) avec chips supprimables individuellement
- **Recherche** — insensible aux accents
- **Pagination intelligente** — 10 alertes au démarrage, cache complet chargé au premier filtre
- **PWA installable** — Android (Chrome) et iOS (Safari → Sur l'écran d'accueil)
- **Mode hors-ligne** — shell précaché + bandeau indicateur
- **Carte GeoJSON** (bonus) — localisation de chaque alerte sur OpenStreetMap via Leaflet

---

## Structure des fichiers clés

```
src/
├── services/
│   ├── alertes.js        ← Appels API, mapping, GeoJSON
│   └── listes.js         ← Liste arrondissements + extraction + getSujets()
├── pages/
│   ├── Accueil/          ← Liste, filtres, recherche, pagination
│   └── DetailAlerte/     ← Page de détail + carte Leaflet
└── components/
    └── BandeauHorsLigne/ ← Indicateur mode hors-ligne
```

---

## Scores Lighthouse

Testé sur `npm run preview` en mode navigation privée, émulation Moto G Power, connexion 4G lente.

| Catégorie | Score |
|---|---|
| **Performances** | 97 |
| **Accessibilité** | 100 |
| **Bonnes pratiques** | 100 |
| **SEO** | 100 |

---

## Dépendances principales

```bash
# Production
npm install react react-dom react-router-dom leaflet react-leaflet

# Développement
npm install -D vite @vitejs/plugin-react vite-plugin-pwa
```


![Scores Lighthouse](./screenshots/lighthouse.png)


