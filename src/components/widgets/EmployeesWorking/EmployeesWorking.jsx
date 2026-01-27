import Card from "@components/Card/Card";
import Avatar from "@components/Avatar/Avatar";
import { getItem } from "@services/storage";
import { User } from "lucide-react";
import styles from "./EmployeesWorking.module.css";

function EmployeesWorking({ className }) {
  const users = getItem("users");

  return (
    <div className={`${styles.dashboard} ${className}`}>
      <Card className={styles.chart} desc={"Funcionários trabalhando"}>
        <div className={`${styles.cards} flex`}>
          {users.map((user) => (
            <div className={`${styles.containerCards} flex`}>
              <Avatar key={user.id} name={user.name} />
              <p>{user.name.split(" ")[0]}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default EmployeesWorking;
