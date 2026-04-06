import { AlertTriangle, Package } from "lucide-react";
import { getItem } from "../../../services/storage";
import styles from "./LowStock.module.css";

function LowStock({ className }) {
  const products = (getItem("products") || [])
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <span className={styles.subtitle}>Atencao</span>
          <h3 className={styles.title}>Estoque Baixo</h3>
        </div>
        {products.length > 0 && (
          <span className={styles.badge}>{products.length}</span>
        )}
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={32} />
          <p>Todos os produtos estao com estoque adequado</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {products.map((p) => (
            <li key={p.id} className={styles.item}>
              <div className={styles.productInfo}>
                <span className={styles.productName}>{p.name}</span>
                <span className={styles.productCategory}>{p.categoria}</span>
              </div>
              <div className={styles.stockInfo}>
                <span className={styles.stockCount}>
                  {p.stock} {p.stock > 1 ? "un." : "un."}
                </span>
                <div className={styles.stockBar}>
                  <div 
                    className={styles.stockProgress} 
                    style={{ width: `${Math.min((p.stock / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LowStock;
