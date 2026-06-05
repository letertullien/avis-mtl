import styles from "./Abonnement.module.css";

function Abonnement({ onOuvrir }) {
  return (
    <section className={styles.abonnement}>
      <h2>S'abonner aux alertes</h2>
      <p>
        Pour recevoir des avis et alertes par courriel ou texto, vous devez
        avoir créé un compte.
      </p>
      <button className={styles.lienAbonner} onClick={onOuvrir}>
        M'abonner →
      </button>
    </section>
  );
}

export default Abonnement;