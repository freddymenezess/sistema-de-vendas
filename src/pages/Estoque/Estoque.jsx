import { useEffect, useState } from "react";
import Card from "@components/Card/Card";
import { getItem } from "@services/storage";
import styles from "./Estoque.module.css";

function Estoque({ className }) {
  const [products, setProducts] = useState([]);

  const loadProducts = () => {
    const data = getItem("products") || [];
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();

    // Atualiza automaticamente se houver alteração no localStorage
    const handleStorage = () => loadProducts();
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      <header>
        <h2>Stock</h2>
        <p className="subt">Acompanhe a disponibilidade dos produtos</p>
      </header>

      <div className={styles.grid}>
        {products.length === 0 && (
          <p className={styles.empty}>Nenhum produto cadastrado.</p>
        )}

        {products.map((product) => {
          const isLowStock = product.stock <= product.minStock;

          return (
            <Card key={product.id} classContainer={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.imageBox}>
                  <img src={product.src} alt={product.name} />
                </div>

                <div className={styles.info}>
                  <h3>{product.name}</h3>
                  <p className={styles.code}>Código: {product.code}</p>
                  <p className={styles.category}>
                    Categoria: {product.categoria}
                  </p>
                  <p className={styles.category}>
                    Estoque mínimo: {product.minStock}
                  </p>
                </div>
              </div>

              <div className={styles.stockRow}>
                <p className={styles.price}>Preço: {product.price} kz</p>
                <span
                  className={`${styles.stock} ${
                    isLowStock ? styles.lowStock : ""
                  }`}
                >
                  Estoque atual: {product.stock}{" "}
                  {isLowStock && (
                    <span className={styles.warning}>⚠ Stock baixo</span>
                  )}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Estoque;
