import { useRef } from "react"
import Card from "@components/Card/Card";
import Avatar from "@components/Avatar/Avatar";
import usersStorage from "@data/users.json"
import { getItem } from "@services/storage";
import styles from "./EmployeesWorking.module.css";

function EmployeesWorking({ className }) {
  const users = getItem("users") || usersStorage;
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -120,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 120,
      behavior: "smooth",
    });
  };
  
  return (
    <div className={`${styles.dashboard} ${className}`}>
      <Card
        className={`${styles.chart} flex`}
        desc={"Funcionários trabalhando"}
      >
        <div className={styles.wrapper}>
          <button
            className={`${styles.navButton} ${styles.prev}`}
            onClick={scrollLeft}
            aria-label="Scroll para esquerda"
          >
            ‹
          </button>
          <div ref={scrollRef} className={`${styles.cards} flex`}>
            {users.map((user) => (
              <div className={`${styles.containerCards} flex`}>
                <Avatar key={user.id} name={user.name} />
                <p>{user.name.split(" ")[0]}</p>
              </div>
            ))}
          </div>
          <button
            className={`${styles.navButton} ${styles.next}`}
            onClick={scrollRight}
            aria-label="Scroll para direita"
          >
            ›
          </button>
        </div>
      </Card>
    </div>
  );
}

export default EmployeesWorking;
