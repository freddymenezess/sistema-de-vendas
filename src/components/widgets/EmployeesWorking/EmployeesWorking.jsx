import Card from "@components/Card/Card"
import { getItem } from "@services/storage";
import { User } from "lucide-react";
import styles from "./EmployeesWorking.module.css";

function EmployeesWorking({ className }) {
  const users = getItem("users")
    .map((user) => user.name
      .split(" ")[0])
    .join(", ");

  return (
    <div className={`${styles.dashboard} ${className}`}>
      <Card
        className={styles.chart}
        icon={User}
        desc={"Funcionários trabalhando"}
        dest={users}
      />
    </div>
  );
}

export default EmployeesWorking;
