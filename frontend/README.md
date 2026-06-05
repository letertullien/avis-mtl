# Avis et alertes – Ville de Montréal (Projet 2)

Application React transformée en PWA installable et fonctionnelle hors connexion, branchée sur les données réelles de la Ville de Montréal.

## Étudiant

Tertullien KOUMETIO TANE

## Installation et démarrage

### Prérequis

- Node.js 18+
- npm

### Étapes

```bash
# 1. Cloner le dépôt
git clone <url-du-depot>
cd avis-alertes-montreal

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev

# 4. Build de production
npm run build

# 5. Prévisualiser le build (requis pour tester le SW et la PWA)
npm run preview
```

L'application est accessible à `http://localhost:5173` en dev et `http://localhost:4173` en preview.

---

## Structure du projet

```
src/
├── components/
│   ├── Abonnement/           ← encart S'abonner
│   ├── BandeauHorsLigne/     ← indicateur visuel mode hors-ligne
│   ├── CarteAlerte/          ← carte d'une alerte dans la liste
│   ├── Chargement/           ← spinner de chargement
│   ├── Entete/               ← en-tête partagée
│   ├── Layout/               ← mise en page commune
│   └── PiedDePage/           ← pied de page
├── pages/
│   ├── Accueil/              ← liste avec recherche, filtres multi-valeurs, chips
│   │   ├── BoutonSupprimer/  ← bouton Tout effacer
│   │   └── filtre/           ← composant Filtre
│   ├── DetailAlerte/         ← page de détail avec lien vers montreal.ca
│   └── PageIntrouvable/      ← page 404
├── services/
│   └── alertes.js            ← appels API + mapping + extraction arrondissement
├── utils/
│   └── Normaliser.js         ← normalisation pour recherche insensible aux accents
├── App.jsx
├── main.jsx                  ← point d'entrée + enregistrement Service Worker
└── sw.js                     ← pas utilisé (voir public/sw.js)
public/
├── sw.js                     ← Service Worker
├── manifest.webmanifest      ← manifeste PWA
├── icons/                    ← icônes 192, 512, maskable, Apple Touch
└── screenshots/              ← captures mobile et desktop pour l'install PWA
```

---

## Données — API de la Ville de Montréal

Les données proviennent du portail de données ouvertes :

```
https://donnees.montreal.ca/api/3/action/datastore_search
  ?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336
```

### Normalisation (mapping)

L'API ne fournit pas de champ `arrondissement`. Une fonction `extraireArrondissement()` dans `src/services/alertes.js` extrait l'arrondissement depuis le titre via une expression régulière :

```
"...arrondissement de Montréal-Nord" → "Montréal-Nord"
"...arrondissement du Plateau-Mont-Royal" → "Plateau-Mont-Royal"
```

| Champ API       | Champ interne   | Transformation                        |
|-----------------|-----------------|---------------------------------------|
| `_id`           | `id`            | Converti en string                    |
| `titre`         | `titre`         | Direct                                |
| *(absent)*      | `arrondissement`| Extrait du titre par regex            |
| `type`          | `sujet`         | Direct                                |
| `date_debut`    | `dateEmission`  | Tronqué à 10 caractères (YYYY-MM-DD)  |
| `date_fin`      | `dateFin`       | Tronqué à 10 caractères (YYYY-MM-DD)  |
| `lien`          | `lien`          | Direct                                |

---

## Fonctionnalités PWA

### Manifeste

Fichier `public/manifest.webmanifest` configuré avec :
- `name`, `short_name`, `description`, `start_url`, `scope`
- `display: "standalone"`, `orientation: "portrait"`
- `theme_color`, `background_color`, `lang: "fr-CA"`
- Icônes : 192×192 (any), 512×512 (any), 512×512 (maskable), 180×180 (Apple Touch)
- Screenshots mobile (narrow) et desktop (wide) pour l'interface d'installation enrichie

### Service Worker

Fichier `public/sw.js` — enregistré depuis `src/main.jsx`.

#### Stratégies de mise en cache

| Ressource | Stratégie | Cache | Justification |
|---|---|---|---|
| Assets statiques (JS, CSS, HTML, images) | **Cache First** | `avis-mtl-statique-v1` | Ces fichiers changent rarement ; répondre depuis le cache est instantané |
| API Ville de Montréal (`donnees.montreal.ca`) | **Stale-While-Revalidate** | `avis-mtl-api-v1` | L'utilisateur voit les données immédiatement depuis le cache, pendant que le SW récupère une version fraîche en arrière-plan |

#### Mode hors-ligne

- Le shell applicatif (index.html, JS, CSS) est précaché à l'installation du SW
- Les dernières alertes téléchargées restent consultables
- La navigation entre l'accueil et la page de détail fonctionne
- Un bandeau jaune informe l'utilisateur qu'il est hors connexion (composant `BandeauHorsLigne`)

### Scores Lighthouse (build de production)

| Catégorie | Score |
|---|---|
| Performances | 76 |
| Accessibilité | 92 |
| Bonnes pratiques | 100 |
| SEO | 83 |

> La catégorie PWA a été intégrée dans "Bonnes pratiques" depuis Lighthouse 12.

---

## Choix techniques

### Filtres multi-valeurs
Les filtres arrondissement et sujet utilisent des **tableaux** au lieu de strings. La logique applique un **OU** à l'intérieur d'un filtre (plusieurs arrondissements sélectionnés) et un **ET** entre les filtres (arrondissement ET sujet). Les valeurs actives s'affichent sous forme de chips supprimables individuellement.

### Pagination — Charger plus
L'API supporte `limit` et `offset`. Le bouton "Charger plus" appelle `getAlertes(offset)` avec l'offset courant pour charger les 10 alertes suivantes sans recharger les précédentes.

### Séparation des responsabilités
`src/services/alertes.js` contient uniquement la logique d'accès aux données (fetch + mapping). Les composants ne connaissent pas la structure brute de l'API — ils travaillent uniquement avec le modèle interne.