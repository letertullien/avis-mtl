import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import styles from "./Entete.module.css";
import loupe from '../../assets/loupe.png';
import BoutonAlerte from "./BoutonAlerte/BoutonAlerte";

function Entete() {

  return (
    <header className={styles.header}>

      <div className={styles.bandeau}>
        <a href="#" className={styles.bandeauLien}>English</a>
      </div>

      <div className={styles.disposition}>

        <Link to="/" className={styles.logo}>
          <img src={logo} alt="Ville de Montréal" className={styles.logoImg} width={120} height={40} />
        </Link>

        <div className={styles.separateur} />

        <button aria-label="Ouvrir le menu de navigation" className={styles.menu}>
          <div className={styles.menuIcon}>
            <span />
            <span />
            <span />
          </div>
          <span>Menu</span>
        </button>

        <div className={styles.droite}>

          <button className={styles.btnIcone}>
            <img src={loupe} alt="recherche" width={24} height={24} />
            <span>Recherche</span>
          </button>

          <div className={styles.separateurDroite} />

          <BoutonAlerte />

        </div>
      </div>

    </header>
  );
}

export default Entete;