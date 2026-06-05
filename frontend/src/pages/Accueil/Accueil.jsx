import { useState, useEffect } from "react";
import { getAlertes } from "../../services/alertes";
import { getSujets, ARRONDISSEMENTS } from "../../services/listes";
import CarteAlerte from "../../components/CarteAlerte/CarteAlerte";
import Chargement from "../../components/Chargement/Chargement";
import Abonnement from "../../components/Abonnement/Abonnement";
import BandeauHorsLigne from "../../components/BandeauHorsLigne/BandeauHorsLigne";
import ModaleAbonnement from "../../components/ModaleAbonnement/ModaleAbonnement";
import Filtre from "./filtre/Filtre";
import normaliser from "../../utils/Normaliser";
import styles from "./Accueil.module.css";

const PAR_PAGE = 10;
const ALL_DATA_API = 200;

function Accueil() {

  const [alertes,             setAlertes]             = useState([]);
  const [total,               setTotal]               = useState(0);
  const [chargement,          setChargement]          = useState(true);
  const [chargementPlus,      setChargementPlus]      = useState(false);
  const [erreur,              setErreur]              = useState(null);
  const [modaleOuverte,       setModaleOuverte]       = useState(false);   // État de la modale d'abonnement

  // ── Cache complet ───────────────────────────────────────────────────────
  const [toutesLesAlertes,    setToutesLesAlertes]    = useState([]);       // Chargé au premier filtre
  const [toutCharge,          setToutCharge]          = useState(false);    // true quand toutes les alertes sont en mémoire
  const [chargementTotal,     setChargementTotal]     = useState(false);    // true pendant le chargement du cache complet

  // ── Pagination locale (mode filtré) ────────────────────────────────────
  const [nbVisibles,          setNbVisibles]          = useState(PAR_PAGE); // Contrôle combien d'alertes filtrées sont affichées

  const [sujets,              setSujets]              = useState([]);
  const [recherche,           setRecherche]           = useState("");
  const [filtresArrondissement, setFiltresArrondissement] = useState([]);
  const [filtresSujet,        setFiltresSujet]        = useState([]);
  const [filtreDateDebut,     setFiltreDateDebut]     = useState("");
  const [filtreDateFin,       setFiltreDateFin]       = useState("");



  // ── Chargement initial ──────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getAlertes(0, PAR_PAGE), getSujets()])                     // 10 alertes et tous les sujets en parallèle
      .then(([{ alertes, total }, sujets]) => {
        setAlertes(alertes);
        setTotal(total);
        setSujets(sujets);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);



  // ── Détection des filtres actifs ────────────────────────────────────────
  const aFiltresActifs =
    filtresArrondissement.length > 0 ||
    filtresSujet.length > 0 ||
    filtreDateDebut !== "" ||
    filtreDateFin !== "";

  // true si un filtre OU une recherche est active
  const filtreOuRecherche = aFiltresActifs || recherche !== "";



  // ── Chargement du cache complet au premier filtre ───────────────────────
  useEffect(() => {
    if (filtreOuRecherche && !toutCharge && !chargementTotal) {
      setChargementTotal(true);
      getAlertes(0, ALL_DATA_API)
        .then(({ alertes }) => {
          setToutesLesAlertes(alertes);
          setToutCharge(true);
        })
        .catch((err) => setErreur(err.message))
        .finally(() => setChargementTotal(false));
    }
  }, [filtreOuRecherche, toutCharge, chargementTotal]);



  // Quand les filtres changent, on repart toujours de la première page
  useEffect(() => {
    setNbVisibles(PAR_PAGE);
  }, [recherche, filtresArrondissement, filtresSujet, filtreDateDebut, filtreDateFin]);



  // ── Charger plus ────────────────────────────────────────────────────────
  function handleChargerPlus() {
    if (filtreOuRecherche) {
      setNbVisibles((prev) => prev + PAR_PAGE);
    } else {
      setChargementPlus(true);
      getAlertes(alertes.length, PAR_PAGE)
        .then(({ alertes: nouvelles }) => {
          setAlertes((prev) => [...prev, ...nouvelles]);
        })
        .catch((err) => setErreur(err.message))
        .finally(() => setChargementPlus(false));
    }
  }


  // Réinitialiser les filtres
  function handleReinitialiser() {
    setRecherche("");
    setFiltresArrondissement([]);
    setFiltresSujet([]);
    setFiltreDateDebut("");
    setFiltreDateFin("");
  }


  // Retire un arrondissement du tableau sans toucher aux autres
  function retirerArrondissement(valeur) {
    setFiltresArrondissement((prev) => prev.filter((a) => a !== valeur));
  }


  function retirerSujet(valeur) {
    setFiltresSujet((prev) => prev.filter((s) => s !== valeur));
  }


  // Retourne true si l'alerte passe tous les filtres actifs
  function alerteCorrespond(alerte) {
    const rechercheOk     = recherche === "" || normaliser(alerte.titre).includes(normaliser(recherche));
    const arrondissementOk = filtresArrondissement.length === 0 || filtresArrondissement.includes(alerte.arrondissement);
    const sujetOk         = filtresSujet.length === 0 || filtresSujet.includes(alerte.sujet);
    const dateDebutOk     = filtreDateDebut === "" || alerte.dateEmission >= filtreDateDebut;
    const dateFinOk       = filtreDateFin === "" || alerte.dateEmission <= filtreDateFin;
    return rechercheOk && arrondissementOk && sujetOk && dateDebutOk && dateFinOk;
  }



  // ── Affichages conditionnels ────────────────────────────────────────────

  // Spinner
  if (chargement) {
    return <Chargement />;
  }

  // Erreur API
  if (erreur) {
    return (
      <div className={styles.page}>
        <p className={styles.erreur}>
          Impossible de charger les alertes. Vérifiez votre connexion ou réessayez plus tard.
        </p>
      </div>
    );
  }



  // ── Préparation de l'affichage ──────────────────────────────────────────

  const sourceAlertes   = filtreOuRecherche ? toutesLesAlertes : alertes;
  const alertesFiltrees = sourceAlertes.filter(alerteCorrespond);

  // Alertes réellement affichées à l'écran
  let alertesAffichees;
  let ilResteDesAlertes;

  if (filtreOuRecherche) {
    alertesAffichees  = alertesFiltrees.slice(0, nbVisibles);
    ilResteDesAlertes = nbVisibles < alertesFiltrees.length;
  } else {
    alertesAffichees  = alertesFiltrees;
    ilResteDesAlertes = alertes.length < total;
  }

  // Contenu de la liste selon l'état
  let contenuListe;

  if (filtreOuRecherche && chargementTotal) {
    contenuListe = <Chargement />;                                          // Cache en cours de chargement : spinner
  } else if (alertesAffichees.length === 0) {
    contenuListe = (
      <p className={styles.aucunResultat}>
        Aucune alerte ne correspond à votre recherche.
      </p>
    );
  } else {
    contenuListe = (
      <ul className={styles.liste}>
        {alertesAffichees.map((alerte) => (
          <CarteAlerte key={alerte.id} alerte={alerte} />
        ))}
      </ul>
    );
  }



  // ── Rendu principal ─────────────────────────────────────────────────────
  return (
    <div className={styles.page}>

      <BandeauHorsLigne />                                                  {/* Bandeau jaune si hors-ligne */}

      <h1 className={styles.titre}>Avis et alertes</h1>

      <Filtre
        recherche={recherche}
        setRecherche={setRecherche}
        filtresArrondissement={filtresArrondissement}
        setFiltresArrondissement={setFiltresArrondissement}
        filtresSujet={filtresSujet}
        setFiltresSujet={setFiltresSujet}
        filtreDateDebut={filtreDateDebut}
        setFiltreDateDebut={setFiltreDateDebut}
        filtreDateFin={filtreDateFin}
        setFiltreDateFin={setFiltreDateFin}
        handleReinitialiser={handleReinitialiser}
        retirerArrondissement={retirerArrondissement}
        retirerSujet={retirerSujet}
        aFiltresActifs={aFiltresActifs}
        ARRONDISSEMENTS={ARRONDISSEMENTS}
        SUJETS={sujets}
      />

      <div className={styles.contenu}>                                      {/* Layout deux colonnes */}

        <div className={styles.colonnePrincipale}>
          <p className={styles.resultats}>{alertesFiltrees.length} résultat(s)</p>
          {contenuListe}

          {ilResteDesAlertes && (
            <button
              className={styles.btnChargerPlus}
              onClick={handleChargerPlus}
              disabled={chargementPlus}
            >
              {chargementPlus ? "Chargement…" : "Charger plus"}
            </button>
          )}
        </div>

        <aside className={styles.sidebar}>
          <Abonnement onOuvrir={() => setModaleOuverte(true)} />            {/* Ouvre la modale au clic */}
        </aside>

      </div>

      {/* Modale d'abonnement */}
      {modaleOuverte && (
        <ModaleAbonnement onFermer={() => setModaleOuverte(false)} />
      )}

    </div>
  );
}

export default Accueil;