import { useState, useEffect } from "react";
import styles from "./BandeauHorsLigne.module.css";

function BandeauHorsLigne() {

  const [horsLigne, setHorsLigne] = useState(!navigator.onLine);


  useEffect(() => {

         function handleOnline()  { setHorsLigne(false); }            // on est de retour en ligne // auto call
         function handleOffline() { setHorsLigne(true);  }            // on passe hors-ligne // auto call
           
         window.addEventListener("online",  handleOnline);            // On s'abonne aux deux événements réseau du navigateur 
         window.addEventListener("offline", handleOffline);

         return () => {
             window.removeEventListener("online",  handleOnline);     // Fonction de nettoyage eviter l' écoute continue du composant aprè sa destruction
             window.removeEventListener("offline", handleOffline);
          };

  }, []);  



   
  if (!horsLigne) return null; // online rien

  return (
    <div className={styles.bandeau} role="alert">   {/* offline rien.  Accessibilité role="alert" lecteur d'écran msg important*/} 
      Vous êtes hors connexion. Les dernières alertes téléchargées sont affichées.
    </div>
  );
}

export default BandeauHorsLigne;

 