import { useEffect } from "react";
import useNotifications from "../../hooks/useNotifications";
import styles from "./ModaleAbonnement.module.css";

function ModaleAbonnement({ onFermer }) {

  const { estAbonne, chargement, erreur, sabonner, seDesabonner } = useNotifications();

  // Fermeture avec la touche Échap
  useEffect(() => {
    function gererTouche(e) {
      if (e.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", gererTouche);
    return () => document.removeEventListener("keydown", gererTouche);
  }, [onFermer]);

  // Vérifie si les notifications sont supportées
  const estSupporte = "serviceWorker" in navigator && "PushManager" in window;

  return (
    <div className={styles.overlay} onClick={onFermer}>

      {/* On arrête la propagation pour ne pas fermer en cliquant dans la modale */}
      <div className={styles.modale} onClick={(e) => e.stopPropagation()}>

        <button className={styles.btnFermer} onClick={onFermer} aria-label="Fermer">
          ✕
        </button>

        <h2 className={styles.titre}>Notifications push</h2>

        <p className={styles.description}>
          Abonnez-vous pour recevoir les avis et alertes de la Ville de Montréal
          directement sur votre appareil, même lorsque l'application est fermée.
        </p>

        {/* API Push non disponible sur cet appareil */}
        {!estSupporte && (
          <p className={styles.erreur}>
            Les notifications push ne sont pas disponibles sur cet appareil.
          </p>
        )}

        {/* Erreur lors de l'abonnement */}
        {erreur && (
          <p className={styles.erreur}>{erreur}</p>
        )}

        {/* Boutons selon l'état */}
        {estSupporte && (
          <div className={styles.actions}>
            {estAbonne ? (
              <button
                className={styles.btnDesabonner}
                onClick={seDesabonner}
                disabled={chargement}
              >
                {chargement ? "En cours..." : "Se désabonner"}
              </button>
            ) : (
              <button
                className={styles.btnAbonner}
                onClick={sabonner}
                disabled={chargement}
              >
                {chargement ? "En cours..." : "S'abonner"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ModaleAbonnement;