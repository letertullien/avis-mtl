
import styles from './BoutonAlerte.module.css';
import profil from '../../../assets/profil.png';

function BoutonAlerte({
   handleAlerte
}) {
  return (
    <>
            <button className={styles.btnIcone} onClick={ handleAlerte }>
              <img src={profil} alt="profil" className={styles.profilImg} />
              <span>Mon compte</span>
            </button>
     </>
  );
}

export default BoutonAlerte


    