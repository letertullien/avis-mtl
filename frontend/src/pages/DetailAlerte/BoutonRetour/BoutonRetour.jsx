
import styles from './BoutonRetour.module.css';


function BoutonRetour({
  handleRetour
}) {
  return (
    <>
            <button className={styles.btnRetour} onClick={ handleRetour }>
              ← Retour à la liste
            </button>
     </>
  );
}

export default BoutonRetour;

