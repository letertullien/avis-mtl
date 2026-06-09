import { precacheAndRoute } from 'workbox-precaching';                        // requis par injectManifest

precacheAndRoute(self.__WB_MANIFEST);                                          // précache les assets générés par Vite

const CACHE_STATIQUE = "avis-mtl-statique-v12";                                // pour les assets JS, CSS, HTML, images
const CACHE_API      = "avis-mtl-api-v12";                                     // pour les réponses de l'API de la Ville

                                                                               //  Ressources à précacher à l'installation
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
];
                    // Événement install                                        // Load after SW install  // New version
self.addEventListener("install", (event) => {

  event.waitUntil(                                                              // Next if précache end
    caches.open(CACHE_STATIQUE).then((cache) => cache.addAll(ASSETS))
  );

  self.skipWaiting();                                                            // SW activate directly
});

                    //  Événement activate
self.addEventListener("activate", (event) => {
  const cachesValides = [CACHE_STATIQUE, CACHE_API];                            // Save cache
  event.waitUntil(
    caches.keys().then((clefs) =>                                               // Take all cache
      Promise.all(
        clefs
          .filter((c) => !cachesValides.includes(c))
          .map((c) => caches.delete(c))                                          // clean cache
      )
    )
  );

  self.clients.claim();                                                          // SW take control
});

                 //  Événement fetch
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;                                 // just GET
  if (!event.request.url.startsWith("http")) return;                          // just notre api Request
  const url = new URL(event.request.url);                                     // read data

  // Laisse passer les tuiles OpenStreetMap sans interception
  if (url.hostname.includes("tile.openstreetmap.org")) return;

  // Laisse passer les requêtes vers le backend Render
  if (url.hostname.includes("onrender.com")) return;

  if (url.hostname === "donnees.montreal.ca") {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_API));
    return;
  }

  event.respondWith(cacheFirst(event.request, CACHE_STATIQUE));
});

//  Stratégie Cache First
async function cacheFirst(requete, nomCache) {
  const cache  = await caches.open(nomCache);

  const cached = await cache.match(requete);                                     // Cherche la requête dans le cache

  if (cached) return cached;                                                     // Si trouvé en cache : retourne directement sans appel réseau (instantané)

  try {
    const reponse = await fetch(requete);                                        // Pas en cache : va chercher sur le réseau
    if (reponse.ok) {
      cache.put(requete, reponse.clone());                                       // Lecture
      return reponse;
    }
    return cache.match("/index.html");                                           // réseau répond mais 404/erreur → retourne index.html pour React Router

  } catch {
    return cache.match("/index.html");                                           // pas de réseau du tout → retourne index.html
  }
}

// ── Stratégie Stale-While-Revalidate : Cache First, Update background
async function staleWhileRevalidate(requete, nomCache) {
  const cache = await caches.open(nomCache);                                    // Opencache version or create
  const cached = await cache.match(requete);                                    // exit? send or no? cache

  const reseauPromesse = fetch(requete).then((reponse) => {                     // requette en parrallèle sur le réseau et update silencieux

    if (reponse.ok) {
      cache.put(requete, reponse.clone());                                       // Met à jour le cache avec la version fraîche du réseau
    }
    return reponse;
  });

  return cached || reseauPromesse;                                              // cache? send or wait réseau
}

                    // Événement push — réception d'une notification push
self.addEventListener("push", (event) => {

  console.log("Push reçu !", event.data?.text());                               // Debug temporaire

  let titre   = "Avis MTL";
  let options = {
    body: "Nouvelle notification",
    icon: "/icons/icon-192.png",
    data: { url: "/" },
  };

  if (event.data) {
    try {
      const donnees = event.data.json();
      titre         = donnees.title ?? titre;
      options.body  = donnees.body  ?? options.body;
      options.data  = { url: donnees.url ?? "/" };
    } catch {
      // valeurs par défaut
    }
  }

  event.waitUntil(
    // Envoie le message aux clients ouverts ET affiche la notification système
    self.clients.matchAll({ type: "window" }).then((clients) => {

      // Envoie un message à chaque fenêtre ouverte pour la notification in-app
      clients.forEach((client) => {
        client.postMessage({
          type:  "PUSH_RECU",
          titre,
          corps: options.body,
          url:   options.data.url,
        });
      });

      // Affiche quand même la notification système
      return self.registration.showNotification(titre, options);
    })
  );
});

                    // Événement notificationclick — clic sur une notification
self.addEventListener("notificationclick", (event) => {

  event.notification.close();                                                   // Ferme la notification

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((fenetres) => {                  // Cherche si l'app est déjà ouverte

      for (const fenetre of fenetres) {
        if (fenetre.url === event.notification.data.url && "focus" in fenetre) {
          return fenetre.focus();                                               // Si ouverte → met au premier plan
        }
      }

      return clients.openWindow(event.notification.data.url);                  // Sinon → ouvre une nouvelle fenêtre
    })
  );
});