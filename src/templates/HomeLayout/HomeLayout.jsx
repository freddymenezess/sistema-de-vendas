import { SelectedProductProvider } from "@context/SelectedProductProvider";
import { Outlet } from "react-router-dom";
import Header from "@components/Header/Header";
import NavBar from "@components/NavBar/NavBar";
import Menu from "@components/Menu/Menu";
import styles from "./HomeLayout.module.css";

function HomeLayout() {
  return (
    <SelectedProductProvider>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <section className={styles.outletContainer}>
            <div className={styles.outlet}>
              <Outlet />
            </div>
            <Menu className={styles.menu} />
          </section>
        </main>
      </div>
    </SelectedProductProvider>
  );
}

export default HomeLayout;
