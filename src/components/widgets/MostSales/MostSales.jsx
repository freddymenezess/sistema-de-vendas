import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import products from "@data/products.json";
import Card from "@components/Card/Card";
import styles from "./MostSales.module.css";

function MostSales({ className }) {
  const sorted = [...products].sort((a, b) => b.vendas - a.vendas).slice(0, 6);

  const topProduct = sorted[0];
  const otherProducts = sorted.slice(1);

  return (
    <Card className={`${styles.card} ${className}`}>
      <header className={styles.header}>
        <div className={styles.icon}>
          <TrendingUpIcon />
        </div>
        <div>
          <p className={styles.subtitle}>Performance</p>
          <h2 className={styles.title}>Produtos Mais Vendidos</h2>
        </div>
      </header>

      {/* Produto destaque */}
      <div className={styles.featured}>
        <div className={styles.featuredInfo}>
          <span className={styles.badge}>TOP 1</span>
          <h3>{topProduct.nome}</h3>
          <p>{topProduct.vendas} vendas realizadas</p>
        </div>

        <div className={styles.featuredStats}>
          <span className={styles.price}>
            {topProduct.price.toLocaleString("pt-AO", {
              style: "currency",
              currency: "AOA",
            })}
          </span>
          <span className={styles.stock}>{topProduct.estoque} em stock</span>
        </div>
      </div>

      {/* Grid secundário */}
      <div className={styles.grid}>
        {otherProducts.map((product, index) => (
          <div key={product.id} className={styles.item}>
            <div>
              <h4>{product.nome}</h4>
              <span className={styles.sales}>{product.vendas} vendas</span>
            </div>

            <div className={styles.right}>
              <span className={styles.smallPrice}>
                {product.price.toLocaleString("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                })}
              </span>
              <span className={styles.smallStock}>{product.estoque} stock</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default MostSales;
