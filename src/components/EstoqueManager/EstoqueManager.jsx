import { useEffect, useState } from "react";
import styles from "./EstoqueManager.module.css";

function EstoqueManager() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  return (
    <div className={styles.container}>
      <h2>Gestão de Estoque</h2>

      <div className={styles.grid}>
        {products.map((product) => {
          const lowStock = product.stock <= product.minStock;

          return (
            <div
              key={product.id}
              className={`${styles.card} ${lowStock ? styles.lowStock : ""}`}
            >
              <img
                src={product.src || "/prods/default.png"}
                alt={product.name}
                className={styles.image}
              />

              <h3>{product.name}</h3>
              <p className={styles.category}>{product.categoria}</p>

              <p className={styles.price}>
                {product.price.toLocaleString()} Kz
              </p>

              <div className={styles.stockInfo}>
                <span>Estoque: {product.stock}</span>

                {lowStock && (
                  <span className={styles.warning}>Estoque baixo</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EstoqueManager;
