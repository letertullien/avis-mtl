import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationInApp.module.css";

function NotificationInApp() {

  const [notification, setNotification] = useState(null);  // Notification reçue
  const navigate = useNavigate();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Écoute les messages du Service Worker
    function ecouterMessage(event) {
      if (event.data?.type === "PUSH_RECU") {
        setNotification({
          titre: event.data.titre,
          corps: event.data.corps,
          url:   event.data.url,
        });

        // Ferme automatiquement après 5 secondes
        setTimeout(() => setNotification(null), 5000);
      }
    }

    navigator.serviceWorker.addEventListener("message", ecouterMessage);
    return () => navigator.serviceWorker.removeEventListener("message", ecouterMessage);
  }, []);

  if (!notification) return null;

  function handleClic() {
    setNotification(null);
    navigate(notification.url);
  }

  return (
    <div className={styles.banniere} onClick={handleClic}>
      <div className={styles.icone}>🔔</div>
      <div className={styles.contenu}>
        <p className={styles.titre}>{notification.titre}</p>
        <p className={styles.corps}>{notification.corps}</p>
      </div>
      <button
        className={styles.fermer}
        onClick={(e) => { e.stopPropagation(); setNotification(null); }}
      >
        ✕
      </button>
    </div>
  );
}

export default NotificationInApp;