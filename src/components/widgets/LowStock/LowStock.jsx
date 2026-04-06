import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getItem } from "@services/storage";
import Card from "@components/Card/Card";
import styles from "./LowStock.module.css";

function LowStock({ className }) {
  const products = (getItem("products") || [])
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3);

  return (
    <Card className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <WarningAmberIcon />
        <h3>Estoque baixo</h3>
      </div>

      <ul className={styles.list}>
        {products.map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <strong>
              {p.stock} {p.stock > 1 ? "unidades" : "unidade"}
            </strong>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default LowStock;
