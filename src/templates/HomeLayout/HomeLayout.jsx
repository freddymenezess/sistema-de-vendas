import { SelectedProductProvider } from "@context/SelectedProductProvider";
import { Outlet } from "react-router-dom";
import NavBar from "@components/NavBar/NavBar";
import styles from "./HomeLayout.module.css";

function HomeLayout() {
  return (
    <SelectedProductProvider>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </SelectedProductProvider>
  );
}

export default HomeLayout;
