import { Outlet } from "react-router-dom";
import { MenuProvider } from "@context/MenuProvider"
import Header from "@components/Header/Header";
import NavBar from "@components/NavBar/NavBar";
import styles from "./MainLayout.module.css";

function MainLayout() {
  return (
    <MenuProvider>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.headerRow}>
            <NavBar />
            <Header />
          </div>
          <section className={styles.outletContainer}>
            <div className={styles.outlet}>
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </MenuProvider>
  );
}

export default MainLayout;
