import { LayoutDashboard } from "lucide-react";
import SalesStatistics from "../../components/widgets/SalesStatistics/SalesStatistics";
import SalesChart from "../../components/SalesChart/SalesChart";
import LowStock from "../../components/widgets/LowStock/LowStock";
import MostSales from "../../components/widgets/MostSales/MostSales";

import styles from "./Dashboard.module.css";

function Dashboard() {
  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper}>
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1>Dashboard</h1>
            <p>Visualize os indicadores e desempenho em tempo real</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className={styles.statsGrid}>
        <SalesStatistics />
        <LowStock />
      </section>

      {/* Main Content */}
      <section className={styles.mainGrid}>
        <MostSales className={styles.mostSales} />
        <SalesChart className={styles.chart} />
      </section>
    </div>
  );
}

export default Dashboard;
