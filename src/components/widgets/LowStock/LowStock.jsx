import { AlertTriangle } from "lucide-react";
import { getItem, setItem } from "@services/storage.js";
import lowProducts from "@data/lowProducts.json";
import styles from "./LowStock.module.css";

function LowStock() {
  if (!getItem("lowProducts")) {
    setItem("lowProducts", lowProducts);
  }

  const products = getItem("lowProducts").slice(0, 3);

  return (
    <div className={`${styles.card} ${styles.alerta}`}>
      <header>
        <AlertTriangle />
        <h2>Estoque baixo</h2>
      </header>
      <ul className={`${styles.list} list`}>
        {products.map((p) => (
          <li key={p.id}>
            {p.nome}
            <strong className={styles.danger}>{p.estoque} {
              p.estoque > 1 ? "unidades" : "unidade"
            }
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LowStock;
