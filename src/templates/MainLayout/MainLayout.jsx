import { Outlet } from "react-router-dom";
import NavBar from "@components/NavBar/NavBar";
import styles from "./MainLayout.module.css";

function MainLayout() {
  return (
    <div className={styles.container}>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.outletContainer}>
          <div className={styles.outlet}>
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainLayout;
