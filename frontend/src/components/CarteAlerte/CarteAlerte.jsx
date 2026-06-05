 import { Link } from "react-router-dom"; // Link permet de naviguer vers une autre page sans recharger l'application
import calendrier from "../../assets/calendrier.png";
import styles from "./CarteAlerte.module.css";

function CarteAlerte({ alerte }) {

  const id           = alerte.id;
  const titre        = alerte.titre;
  const sujet        = alerte.sujet;
  const dateEmission = alerte.dateEmission;

  return (

    <li className={styles.carte}>

            <Link to={`/alertes/${id}`} className={styles.titre}>
              {titre}
            </Link>

            <span className={styles.sujet}>{sujet}</span>

            <div className={styles.meta}>
                <img src={calendrier} alt="date" className={styles.icone} width={16} height={16} />
                <span className={styles.date}>{dateEmission}</span>
          </div>

    </li>

  );
}

export default CarteAlerte;