import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getItem } from "@services/storage";
import Card from "@components/Card/Card";
import styles from "./LowStock.module.css";

function LowStock({ className }) {
  const products = getItem("lowProducts")?.slice(0, 3) || [];

  return (
    <Card className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <WarningAmberIcon />
        <h3>Estoque baixo</h3>
      </div>

      <ul className={styles.list}>
        {products.map((p) => (
          <li key={p.id}>
            <span>{p.nome}</span>
            <strong>
              {p.estoque} {p.estoque > 1 ? "unidades" : "unidade"}
            </strong>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default LowStock;
