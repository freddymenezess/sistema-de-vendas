import Card from "@components/Card/Card"
import { ShoppingCart } from "lucide-react";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./SalesStatistics.module.css";

function SalesStatistics({ className }) {
  return (
    <div className={`${styles.dashboard} ${className}`}>
      <Card
        className={styles.chart}
        icon={ShoppingCart}
        desc={"Total de vendas hoje"}
        dest={handleFormatCoin(52000)}
      />
    </div>
  );
}

export default SalesStatistics;
