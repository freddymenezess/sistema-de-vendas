import { Outlet } from 'react-router-dom';
import { MenuProvider } from '@context/MenuProvider'
import Header from '@components/Header/Header';
import NavBar from '@components/NavBar/NavBar';
import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    <MenuProvider>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.main}>
          <Header />
          <section className={styles.outlet}>
            <Outlet />
          </section>
        </main>
      </div>
    </MenuProvider>
  );
}

export default MainLayout;
