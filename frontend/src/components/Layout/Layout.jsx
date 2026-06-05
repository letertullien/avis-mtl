import { Outlet } from "react-router-dom";
import Entete from "../Entete/Entete";
import PiedDePage from "../PiedDePage/PiedDePage";
import NotificationInApp from "../NotificationInApp/NotificationInApp";
import styles from "./Layout.module.css";

function Layout() {
  return (
    <div className={styles.layout}>
      <Entete />
      <main className={styles.main}>
        <Outlet />
      </main>
      <PiedDePage />
      <NotificationInApp />
    </div>
  );
}

export default Layout;