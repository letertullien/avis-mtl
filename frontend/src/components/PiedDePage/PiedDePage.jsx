
import styles from "./PiedDePage.module.css";

function PiedDePage() { 
  return (
    <footer className={styles.footer}>
      <div className={styles.organisation}>
        <div className={styles.colonnes}>
          
          <div className={styles.colonne}>
            <h3>Mon compte</h3>
            <ul>
              <li><a href="#">À propos de mon compte</a></li>
              <li><a href="#">Avis et alertes</a></li>
              <li><a href="#">Créer mon compte</a></li>
            </ul>
          </div>

          <div className={styles.colonne}>
            <h3>Communiquer avec nous</h3>
            <ul>
              <li><a href="#">Nous joindre</a></li>
              <li><a href="#">Salle des médias</a></li>
            </ul>
          </div>

          <div className={styles.colonne}>
            <h3>Travailler avec nous</h3>
            <ul>
              <li><a href="#">Appels d'offres</a></li>
              <li><a href="#">Emplois</a></li>
              <li><a href="#">Fournisseurs</a></li>
            </ul>
          </div>

          <div className={styles.colonne}>
            <h3>Nous suivre</h3>
            <ul>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">X (Twitter)</a></li>
              <li><a href="#">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bas}>
          <p className={styles.copyright}>© Ville de Montréal</p>
          <ul className={styles.mentions}>
            <li><a href="#">Politique de confidentialité</a></li>
            <li><a href="#">Mentions légales</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default PiedDePage;