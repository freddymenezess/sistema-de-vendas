import SalesStatistics from "@widgets/SalesStatistics/SalesStatistics";
import SalesChart from "@components/SalesChart/SalesChart";
import LowStock from "@widgets/LowStock/LowStock";
import MostSales from "@widgets/MostSales/MostSales";

import styles from "./Dashboard.module.css";

function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <section className={styles.title}>
        <header>
          <h2>Dashboard</h2>
          <p className="subt">
            Visualize os indicadores e desempenho em tempo real
          </p>
        </header>
      </section>
      <div className={styles.grid}>
        <SalesStatistics />
        <LowStock />
        <MostSales className={styles.fullWidth} />
        <SalesChart className={styles.fullWidth} />
      </div>
    </section>
  );
}

export default Dashboard;
