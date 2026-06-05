import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlerteById, getGeometrieByTitre } from "../../services/alertes";
import Chargement from "../../components/Chargement/Chargement";
import Abonnement from "../../components/Abonnement/Abonnement";
import BoutonRetour from "./BoutonRetour/BoutonRetour";
import CarteAlerteDetail from "../../components/CarteAlerteDetail/CarteAlerteDetail";
import styles from "./DetailAlerte.module.css";

function DetailAlerte() {

    const { id } = useParams();                                     // id l'URL 
    const navigate = useNavigate();                                 // retour à l'accueil
    const [alerte, setAlerte] = useState(null); 
    const [geometrie, setGeometrie] = useState(null);               // Géométrie GeoJSON 
    const [chargement, setChargement] = useState(true);            // spinner
    const [erreur, setErreur] = useState(null);

    
    function handleRetour() {   // Retour Accueil
      navigate("/");
    }

    // ── Chargement de l'alerte et de sa géométrie ──────────────────────────
    
    useEffect(() => {

      // 1. l'alerte par son identifiant
      getAlerteById(id)
        .then((data) => {
          setAlerte(data);

          if (data) {
            // 2. La géométrie depuis le GeoJSON  
            getGeometrieByTitre(data.titre)
              .then((geo) => setGeometrie(geo))
              .catch(() => setGeometrie(null));
          }
        })
        .catch((err) => setErreur(err.message))
        .finally(() => setChargement(false)); //  arrêter le spinner

    }, [id]);

    // Affichages conditionnels  
 
    if (chargement) {
      return <Chargement />;
    }

    // Erreur API  
    if (erreur) {
      return (
        <div className={styles.page}>
          <BoutonRetour handleRetour={handleRetour} />
          <p className={styles.erreur}>
            Impossible de charger cette alerte. Vérifiez votre connexion ou réessayez plus tard.
          </p>
        </div>
      );
    }

    // Alerte introuvable? : bouton retour
    if (!alerte) {
      return (
        <div className={styles.page}>
          <BoutonRetour handleRetour={handleRetour} />
          <p>Alerte introuvable.</p>
        </div>
      );
    }

    // ── Rendu principal  
    return (
      <div className={styles.page}>
 
        <BoutonRetour handleRetour={handleRetour} /> {/* Bouton retour */}

        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane">
              <ol className={styles.filAriane}>
                    <li>Accueil</li>
                    <li>Avis et alertes</li>
                    <li>{alerte.titre}</li>
              </ol>
        </nav>



        <header className={styles.entete}>

              <h1 className={styles.titre}>{alerte.titre}</h1>

              <div className={styles.meta}>
                      <span className={styles.sujet}>{alerte.sujet}</span>
                      <span className={styles.arrondissement}>{alerte.arrondissement}</span>
                      <span className={styles.date}>Publié le {alerte.dateEmission}</span>
              </div>

        </header>

        {/* Layout deux colonnes : contenu à gauche, encart S'abonner à droite */}
        <div className={styles.contenu}>
          <div className={styles.corps}>

            {/* L'API ne fournit pas de description — le contenu complet est sur montreal.ca */}
            <p className={styles.avis}>
              Pour consulter le contenu complet de cet avis, visitez la page officielle de la Ville de Montréal.
            </p>
 
            {alerte.lien && (
              <a
                href={alerte.lien}
                target="_blank"                        // New Onglet
                rel="noopener noreferrer"              // Contre attaque window.opener
                className={styles.lienOfficiel}
              >
                Voir l'alerte sur montreal.ca →
              </a>
            )}

            {/* Carte de localisation */}
            <h2 className={styles.titreCarte}>Localisation</h2>
            <CarteAlerteDetail geometrie={geometrie} titre={alerte.titre} />
          </div>

          <aside className={styles.sidebar}>
            <Abonnement />
          </aside>
        </div>

      </div>
    );
}

export default DetailAlerte;