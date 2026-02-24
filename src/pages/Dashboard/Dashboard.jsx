import SalesStatistics from "@widgets/SalesStatistics/SalesStatistics";
import SalesChart from "@components/SalesChart/SalesChart";
import LowStock from "@widgets/LowStock/LowStock";
import MostSales from "@widgets/MostSales/MostSales";

import styles from "./Dashboard.module.css";

function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <section className={styles.title}>
        <h2>Dashboard</h2>
      </section>
      <div className={styles.grid}>
        <SalesStatistics />
        <LowStock />
        <SalesChart className={styles.fullWidth} />
        <MostSales className={styles.fullWidth} />
      </div>
    </section>
  );
}

export default Dashboard;
