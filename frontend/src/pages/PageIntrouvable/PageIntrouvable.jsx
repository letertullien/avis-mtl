
import { Link } from "react-router-dom";
import styles from "./PageIntrouvable.module.css";

function PageIntrouvable() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.titre}>Page introuvable</h1>
      <p className={styles.description}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className={styles.lienRetour}>
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default PageIntrouvable;