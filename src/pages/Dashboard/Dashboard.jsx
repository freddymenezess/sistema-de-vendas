import SalesStatistics from "@widgets/SalesStatistics/SalesStatistics";
import EmployeesWorking from "@widgets/EmployeesWorking/EmployeesWorking";
import MostSales from "@widgets/MostSales";
import SalesChart from "@components/SalesChart/SalesChart";
import LowStock from "@widgets/LowStock/LowStock";

import styles from "./Dashboard.module.css";

function Dashboard() {
  return (
    <section className={styles.dashboard}>
      <section className={styles.dasboard}>
        <h2>Dashboard</h2>
      </section>
      <SalesStatistics className={styles.vendas} />
      <EmployeesWorking className={styles.team} />
      <MostSales className={styles.sales} />
      <LowStock className={styles.lowstock} />
      <SalesChart className={styles.statistics} />
    </section>
  );
}

export default Dashboard;
