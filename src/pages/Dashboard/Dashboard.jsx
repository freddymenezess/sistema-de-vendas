import LowStock from "@widgets/LowStock/LowStock";
import OnStaff from "@widgets/OnStaff/OnStaff";
import SalesStatistics from "@widgets/SalesStatistics/SalesStatistics";
import SalesChart from "@components/SalesChart/SalesChart";
import MostSales from "@widgets/MostSales/MostSales";
import Card from "@components/Card/Card";

import styles from "./Dashboard.module.css";

function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <SalesStatistics />
      <MostSales />

    </section>
  );
}

export default Dashboard;
