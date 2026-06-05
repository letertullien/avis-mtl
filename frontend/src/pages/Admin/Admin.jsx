import { useState, useEffect } from "react";
import styles from "./Admin.module.css";

const BACKEND_URL = "https://avis-mtl-backend.onrender.com";

function Admin() {

  const [titre,        setTitre]        = useState("");
  const [corps,        setCorps]        = useState("");
  const [url,          setUrl]          = useState("/");
  const [resultat,     setResultat]     = useState(null);
  const [envoi,        setEnvoi]        = useState(false);
  const [historique,   setHistorique]   = useState([]);       // ← AJOUT historique

  // Charge l'historique au démarrage
  useEffect(() => {
    chargerHistorique();
  }, []);

  async function chargerHistorique() {
    try {
      const reponse = await fetch(`${BACKEND_URL}/notifications`);
      const json    = await reponse.json();
      setHistorique(json.data);
    } catch {
      console.error("Impossible de charger l'historique");
    }
  }

  async function handleEnvoyer() {
    if (!titre || !corps) {
      setResultat({ succes: false, message: "Le titre et le corps sont obligatoires." });
      return;
    }

    setEnvoi(true);
    setResultat(null);

    try {
      const reponse = await fetch(`${BACKEND_URL}/send-notification`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title: titre, body: corps, url }),
      });

      const json = await reponse.json();

      if (reponse.ok) {
        setResultat({
          succes:  true,
          message: `✅ Envoyé à ${json.data.succes} abonné(s) — ${json.data.echecs} échec(s)`,
        });
        setTitre("");
        setCorps("");
        setUrl("/");
        chargerHistorique();                                   // ← Recharge l'historique
      } else {
        setResultat({ succes: false, message: json.message });
      }

    } catch (err) {
      setResultat({ succes: false, message: "Erreur de connexion au serveur." });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className={styles.page}>

      <h1 className={styles.titre}>Dashboard — Envoyer une notification</h1>

      <div className={styles.formulaire}>

        <label className={styles.label}>Titre</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Ex: Coupure d'eau — Ahuntsic"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
        />

        <label className={styles.label}>Corps</label>
        <textarea
          className={styles.textarea}
          placeholder="Ex: Une interruption d'eau est prévue ce soir..."
          value={corps}
          onChange={(e) => setCorps(e.target.value)}
          rows={4}
        />

        <label className={styles.label}>URL de destination</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Ex: /alertes/42"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          className={styles.bouton}
          onClick={handleEnvoyer}
          disabled={envoi}
        >
          {envoi ? "Envoi en cours..." : "Envoyer à tous les abonnés"}
        </button>

        {resultat && (
          <p className={resultat.succes ? styles.succes : styles.erreur}>
            {resultat.message}
          </p>
        )}

      </div>

      {/* Historique des notifications */}
      {historique.length > 0 && (
        <div className={styles.historique}>
          <h2 className={styles.titreHistorique}>Historique des envois</h2>
          <table className={styles.tableau}>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Date</th>
                <th>Total</th>
                <th>Succès</th>
                <th>Échecs</th>
              </tr>
            </thead>
            <tbody>
              {historique.map((notif) => (
                <tr key={notif._id}>
                  <td>{notif.title}</td>
                  <td>{new Date(notif.sentAt).toLocaleString("fr-CA")}</td>
                  <td>{notif.recipientsCount}</td>
                  <td className={styles.succes}>{notif.successCount}</td>
                  <td className={styles.erreur}>{notif.failureCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default Admin;