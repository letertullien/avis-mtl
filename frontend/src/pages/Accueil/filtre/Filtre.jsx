import { useState } from 'react';
import BoutonSupprime from '../BoutonSupprimer/BoutonSupprime';
import loupe from '../../../assets/loupe.png';
import styles from './Filtre.module.css';

function Filtre({
  recherche, setRecherche,
  filtresArrondissement, setFiltresArrondissement,
  filtresSujet, setFiltresSujet,
  filtreDateDebut, setFiltreDateDebut,
  filtreDateFin, setFiltreDateFin,
  handleReinitialiser,
  retirerArrondissement,
  retirerSujet,
  aFiltresActifs,
  ARRONDISSEMENTS,
  SUJETS
}) {

  // ── Quel panneau est ouvert ? null = aucun, 'arrondissement' | 'date' | 'sujet'
  const [panneauOuvert, setPanneauOuvert] = useState(null);

  // ── Sélections temporaires — ce que l'utilisateur coche AVANT de cliquer "Appliquer"
  // On ne modifie pas les vrais filtres tant que l'utilisateur n'a pas confirmé
  const [selArrondissement, setSelArrondissement] = useState([...filtresArrondissement]);
  const [selSujet,          setSelSujet]          = useState([...filtresSujet]);
  const [selDateDebut,      setSelDateDebut]      = useState(filtreDateDebut);
  const [selDateFin,        setSelDateFin]        = useState(filtreDateFin);

  // ── Ouvre ou ferme un panneau
  // Si on clique sur le même bouton → ferme
  // Si on clique sur un autre → ouvre et remet les sélections temporaires à l'état actuel
  function togglePanneau(nom) {
    if (panneauOuvert === nom) {
      setPanneauOuvert(null);
    } else {
      setSelArrondissement([...filtresArrondissement]);  // remet à l'état actuel
      setSelSujet([...filtresSujet]);
      setSelDateDebut(filtreDateDebut);
      setSelDateFin(filtreDateFin);
      setPanneauOuvert(nom);
    }
  }

  // ── Coche/décoche un arrondissement dans la sélection temporaire
  function toggleSelArrondissement(valeur) {
    setSelArrondissement((prev) =>
      prev.includes(valeur)
        ? prev.filter((a) => a !== valeur)  // déjà coché → retire
        : [...prev, valeur]                 // pas coché → ajoute
    );
  }

  // ── Coche/décoche un sujet dans la sélection temporaire
  function toggleSelSujet(valeur) {
    setSelSujet((prev) =>
      prev.includes(valeur)
        ? prev.filter((s) => s !== valeur)
        : [...prev, valeur]
    );
  }

  // ── Applique les filtres arrondissement — transfère la sélection temporaire vers les vrais filtres
  function appliquerArrondissement() {
    setFiltresArrondissement(selArrondissement);
    setPanneauOuvert(null);                             // ferme le panneau
  }

  // ── Applique les filtres sujet
  function appliquerSujet() {
    setFiltresSujet(selSujet);
    setPanneauOuvert(null);
  }

  // ── Applique les filtres date
  function appliquerDate() {
    setFiltreDateDebut(selDateDebut);
    setFiltreDateFin(selDateFin);
    setPanneauOuvert(null);
  }

  // ── Réinitialise seulement la sélection temporaire (pas les vrais filtres)
  function reinitialiserArrondissement() {
    setSelArrondissement([]);
  }

  function reinitialiserSujet() {
    setSelSujet([]);
  }

  function reinitialiserDate() {
    setSelDateDebut("");
    setSelDateFin("");
  }

  // ── Compte combien de filtres sont actifs par type — affiche le chiffre sur le bouton
  const nbArrondissement = filtresArrondissement.length;
  const nbSujet          = filtresSujet.length;
  const nbDate           = (filtreDateDebut ? 1 : 0) + (filtreDateFin ? 1 : 0);

  return (
    <section className={styles.filtres}>

      <h2 className={styles.filtresTitre}>Trouver un avis</h2>

      {/* ── Barre de recherche par mot-clé ── */}
      <div className={styles.ligneRecherche}>
        <label htmlFor="recherche" className={styles.labelRecherche}>
          Rechercher par mot-clé
        </label>
        <div className={styles.champRecherche}>
          <div className={styles.inputWrapper}>
            <img className={styles.loupeIcone} src={loupe} alt="" width={24} height={24} />
            <input
              type="text"
              id="recherche"
              name="recherche"
              className={styles.recherche}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Que cherchez-vous?"
            />
          </div>
          <button className={styles.btnEffacer} onClick={handleReinitialiser}>
            Effacer
          </button>
        </div>
      </div>

      {/* ── Ligne des 3 boutons dropdown ── */}
      <div className={styles.ligneBoutons}>

        {/* ── Dropdown Arrondissement ── */}
        <div className={styles.dropdown}>

          {/* Bouton principal — devient vert si actif ou si des filtres sont sélectionnés */}
          <button
            className={`${styles.btnDropdown} ${panneauOuvert === 'arrondissement' || nbArrondissement > 0 ? styles.actif : ''}`}
            onClick={() => togglePanneau('arrondissement')}
          >
            Arrondissement {nbArrondissement > 0 ? `(${nbArrondissement})` : ''} ∨
          </button>

          {/* Panneau — s'affiche seulement si ouvert */}
          {panneauOuvert === 'arrondissement' && (
            <div className={styles.panneau}>

              {/* En-tête du panneau */}
              <div className={styles.panneauEntete}>
                <span className={styles.panneauTitre}>Arrondissement</span>
                <button className={styles.panneauFermer} onClick={() => setPanneauOuvert(null)}>✕</button>
              </div>

              {/* Liste des checkboxes — une par arrondissement */}
              <div className={styles.listeChoix}>
                {ARRONDISSEMENTS.map((a) => (
                  <label key={a} className={styles.choix}>
                    <input
                      type="checkbox"
                      checked={selArrondissement.includes(a)}    // coché si dans la sélection temporaire
                      onChange={() => toggleSelArrondissement(a)}
                      className={styles.checkbox}
                    />
                    {a}
                  </label>
                ))}
              </div>

              {/* Boutons Réinitialiser et Appliquer */}
              <div className={styles.panneauActions}>
                <button className={styles.btnReinitialiser} onClick={reinitialiserArrondissement}>
                  Réinitialiser
                </button>
                <button className={styles.btnAppliquer} onClick={appliquerArrondissement}>
                  Appliquer
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ── Dropdown Date ── */}
        <div className={styles.dropdown}>

          <button
            className={`${styles.btnDropdown} ${panneauOuvert === 'date' || nbDate > 0 ? styles.actif : ''}`}
            onClick={() => togglePanneau('date')}
          >
            Date {nbDate > 0 ? `(${nbDate})` : ''} ∨
          </button>

          {panneauOuvert === 'date' && (
            <div className={styles.panneau}>

              <div className={styles.panneauEntete}>
                <span className={styles.panneauTitre}>Date</span>
                <button className={styles.panneauFermer} onClick={() => setPanneauOuvert(null)}>✕</button>
              </div>

              {/* Deux champs date — début et fin */}
              <div className={styles.listeChoix}>
                <label className={styles.labelDate}>
                  Date de début :
                  <input
                    type="date"
                    className={styles.inputDate}
                    value={selDateDebut}
                    onChange={(e) => setSelDateDebut(e.target.value)}
                  />
                </label>
                <label className={styles.labelDate}>
                  Date de fin :
                  <input
                    type="date"
                    className={styles.inputDate}
                    value={selDateFin}
                    onChange={(e) => setSelDateFin(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles.panneauActions}>
                <button className={styles.btnReinitialiser} onClick={reinitialiserDate}>
                  Réinitialiser
                </button>
                <button className={styles.btnAppliquer} onClick={appliquerDate}>
                  Appliquer
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ── Dropdown Sujet ── */}
        <div className={styles.dropdown}>

          <button
            className={`${styles.btnDropdown} ${panneauOuvert === 'sujet' || nbSujet > 0 ? styles.actif : ''}`}
            onClick={() => togglePanneau('sujet')}
          >
            Sujet {nbSujet > 0 ? `(${nbSujet})` : ''} ∨
          </button>

          {panneauOuvert === 'sujet' && (
            <div className={styles.panneau}>

              <div className={styles.panneauEntete}>
                <span className={styles.panneauTitre}>Sujet</span>
                <button className={styles.panneauFermer} onClick={() => setPanneauOuvert(null)}>✕</button>
              </div>

              <div className={styles.listeChoix}>
                {SUJETS.map((s) => (
                  <label key={s} className={styles.choix}>
                    <input
                      type="checkbox"
                      checked={selSujet.includes(s)}
                      onChange={() => toggleSelSujet(s)}
                      className={styles.checkbox}
                    />
                    {s}
                  </label>
                ))}
              </div>

              <div className={styles.panneauActions}>
                <button className={styles.btnReinitialiser} onClick={reinitialiserSujet}>
                  Réinitialiser
                </button>
                <button className={styles.btnAppliquer} onClick={appliquerSujet}>
                  Appliquer
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ── Zone filtres actifs (chips) — affichée seulement si au moins un filtre est actif ── */}
      {aFiltresActifs && (
        <div className={styles.filtresActifs}>
          <p className={styles.labelFiltresActifs}>Filtres actifs :</p>
          <div className={styles.chips}>

            {/* Une chip par arrondissement sélectionné */}
            {filtresArrondissement.map((a) => (
              <span key={a} className={styles.chip}>
                {a}
                <button className={styles.chipSupprimer} onClick={() => retirerArrondissement(a)}>×</button>
              </span>
            ))}

            {/* Une chip par sujet sélectionné */}
            {filtresSujet.map((s) => (
              <span key={s} className={styles.chip}>
                {s}
                <button className={styles.chipSupprimer} onClick={() => retirerSujet(s)}>×</button>
              </span>
            ))}

            {/* Chip date début */}
            {filtreDateDebut && (
              <span className={styles.chip}>
                Depuis : {filtreDateDebut}
                <button className={styles.chipSupprimer} onClick={() => setFiltreDateDebut("")}>×</button>
              </span>
            )}

            {/* Chip date fin */}
            {filtreDateFin && (
              <span className={styles.chip}>
                Jusqu'au : {filtreDateFin}
                <button className={styles.chipSupprimer} onClick={() => setFiltreDateFin("")}>×</button>
              </span>
            )}

          </div>

          {/* Bouton tout effacer */}
          <BoutonSupprime handleReinitialiser={handleReinitialiser} />
        </div>
      )}

    </section>
  );
}

export default Filtre;