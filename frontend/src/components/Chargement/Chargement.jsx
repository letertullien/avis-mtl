

import styles from "./Chargement.module.css";

function Chargement() {
  return (
    <div className={styles.conteneur}>
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.texte}>Chargement en cours…</p>
    </div>
  );
}

export default Chargement;