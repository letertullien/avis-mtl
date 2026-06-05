import { useState, useEffect } from "react";

const BACKEND_URL = "https://avis-mtl-backend.onrender.com";

function useNotifications() {

  const [estAbonne,   setEstAbonne]   = useState(false);   // Est-ce que l'appareil est abonné ?
  const [chargement,  setChargement]  = useState(false);   // En cours de traitement ?
  const [erreur,      setErreur]      = useState(null);    // Message d'erreur

  // Vérifie si l'appareil est déjà abonné au chargement
  useEffect(() => {
    async function verifierAbonnement() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      const registration  = await navigator.serviceWorker.ready;
      const abonnement    = await registration.pushManager.getSubscription();
      setEstAbonne(!!abonnement);                          // true si abonné, false sinon
    }

    verifierAbonnement();
  }, []);

  // Récupère la clé VAPID publique depuis le backend
  async function getCleVapid() {
    const reponse = await fetch(`${BACKEND_URL}/vapid-public-key`);
    const json    = await reponse.json();
    return json.data;
  }

  // Convertit la clé VAPID en format binaire requis par le navigateur
  function urlBase64VersUint8Array(base64String) {
    const padding   = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64    = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData   = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  // Abonne l'appareil aux notifications push
  async function sabonner() {
    setChargement(true);
    setErreur(null);

    // Cas 2 : permission déjà bloquée au niveau du navigateur
    if (Notification.permission === "denied") {
      setErreur("Les notifications sont bloquées. Allez dans les paramètres de votre navigateur pour les autoriser.");
      setChargement(false);
      return;
    }

    try {
      const cleVapid      = await getCleVapid();
      const registration  = await navigator.serviceWorker.ready;

      const abonnement = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64VersUint8Array(cleVapid),
      });

      // Envoie l'abonnement au backend
      await fetch(`${BACKEND_URL}/subscribe`, {
        method:   "POST",
        headers:  { "Content-Type": "application/json" },
        body:     JSON.stringify({ subscription: abonnement }),
      });

      setEstAbonne(true);

    } catch (err) {
      // Cas 1 : permission refusée au moment de la demande
      if (Notification.permission === "denied") {
        setErreur("Vous avez refusé les notifications. Modifiez les paramètres de votre navigateur pour les autoriser.");
      } else {
        setErreur("Impossible de s'abonner. Vérifiez les permissions.");
      }
    } finally {
      setChargement(false);
    }
  }

  // Désabonne l'appareil
  async function seDesabonner() {
    setChargement(true);
    setErreur(null);

    try {
      const registration  = await navigator.serviceWorker.ready;
      const abonnement    = await registration.pushManager.getSubscription();

      if (abonnement) {
        await abonnement.unsubscribe();                    // Désabonne côté navigateur

        // Supprime l'abonnement dans MongoDB
        await fetch(`${BACKEND_URL}/unsubscribe`, {
          method:   "POST",
          headers:  { "Content-Type": "application/json" },
          body:     JSON.stringify({ endpoint: abonnement.endpoint }),
        });
      }

      setEstAbonne(false);

    } catch (err) {
      setErreur("Impossible de se désabonner.");
    } finally {
      setChargement(false);
    }
  }

  // Cas 3 : API Push indisponible sur cet appareil
  const estSupporte = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

  return { estAbonne, estSupporte, chargement, erreur, sabonner, seDesabonner };
}

export default useNotifications;