import { Outlet } from 'react-router-dom';
import NavBar from '@components/NavBar/NavBar';
import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    <div className={styles.container}>
      <NavBar className={styles.nav} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
