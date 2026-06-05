
import styles from './BoutonSupprime.module.css';


function BoutonSupprime({
  handleReinitialiser
}) {
  return (
    <>
            <button className={styles.btnEffacer} onClick={handleReinitialiser}>
              Tout effacer
            </button>
     </>
  );
}

export default BoutonSupprime;