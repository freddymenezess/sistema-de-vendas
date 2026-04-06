import { TrendingUp, ShoppingBag, DollarSign, Package } from "lucide-react";
import { getItem } from "@services/storage";
import styles from "./MostSales.module.css";

function MostSales({ className }) {
  const compras = getItem("compras") || [];

  const salesMap = {};
  compras.forEach((compra) => {
    compra.produtos.forEach((item) => {
      if (!salesMap[item.id]) {
        salesMap[item.id] = { ...item };
      } else {
        salesMap[item.id].quantidade += item.quantidade;
        salesMap[item.id].preco_pagar += item.preco_pagar;
      }
    });
  });

  const sorted = Object.values(salesMap)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  if (sorted.length === 0) {
    return (
      <div className={`${styles.card} ${className || ""}`}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span className={styles.subtitle}>Performance</span>
            <h3 className={styles.title}>Produtos Mais Vendidos</h3>
          </div>
        </div>
        <div className={styles.emptyState}>
          <Package size={48} />
          <p>Nenhuma venda registrada ainda</p>
        </div>
      </div>
    );
  }

  const topProduct = sorted[0];
  const otherProducts = sorted.slice(1);

  return (
    <div className={`${styles.card} ${className || ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <TrendingUp size={24} />
        </div>
        <div>
          <span className={styles.subtitle}>Performance</span>
          <h3 className={styles.title}>Produtos Mais Vendidos</h3>
        </div>
      </div>

      {/* Featured Product */}
      <div className={styles.featured}>
        <div className={styles.featuredHeader}>
          <span className={styles.rankBadge}>TOP 1</span>
          <h4 className={styles.productName}>{topProduct.name}</h4>
        </div>
        <div className={styles.featuredStats}>
          <div className={styles.stat}>
            <div className={styles.statIcon} data-color="primary">
              <ShoppingBag size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Vendidos</span>
              <strong>{topProduct.quantidade}</strong>
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statIcon} data-color="success">
              <DollarSign size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Faturamento</span>
              <strong>
                {topProduct.preco_pagar.toLocaleString("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                })}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Other Products */}
      {otherProducts.length > 0 && (
        <div className={styles.list}>
          {otherProducts.map((item, index) => (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.rank}>{index + 2}</div>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemStats}>
                  {item.quantidade} vendidos
                </span>
              </div>
              <span className={styles.itemTotal}>
                {item.preco_pagar.toLocaleString("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MostSales;
