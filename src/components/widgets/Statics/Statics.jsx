import { DollarSign } from "lucide-react";
import styles from "./Statics.module.css";

function MainCard() {
  const vendasHoje = 125000;
  
  return (
    <div className={styles.destaque}>
      <strong>
        <DollarSign size={44} />
      </strong>
      <div>
        <span>Total vendido hoje</span>
        <h1 className={styles.price}>
          <strong>
            {vendasHoje.toLocaleString("pt-AO", {
              style: "currency",
              currency: "AOA",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </h1>
      </div>
    </div>
  );
}

export default MainCard;