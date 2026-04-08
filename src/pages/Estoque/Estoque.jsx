import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Estoque.module.css";

const CATEGORIAS = [
  "Perfumes",
  "Cremes",
  "Maquiagem",
  "Cabelos",
  "Corpo",
  "Outros",
];

function Estoque() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");

  const loadProducts = () => {
    const data = getItem("products") || [];
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
    const handleStorage = () => loadProducts();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.includes(search);
    const matchCategoria = !categoria || p.categoria === categoria;
    return matchSearch && matchCategoria;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Estoque</h1>
          <p className={styles.subtitle}>Acompanhe a disponibilidade dos produtos</p>
        </div>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas categorias</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} style={{ margin: "0 auto 1rem", color: "#d1d5db" }} />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.minStock;

            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImage}>
                  {product.src ? (
                    <img src={product.src} alt={product.name} />
                  ) : (
                    <Package size={48} />
                  )}
                </div>
                <div className={styles.productContent}>
                  <div className={styles.productCategory}>
                    {product.categoria || "Sem categoria"}
                  </div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productMeta}>
                    <span className={styles.productPrice}>
                      {handleFormatCoin(product.price || 0)}
                    </span>
                    <span
                      className={`${styles.productStock} ${
                        isLowStock ? styles.stockLow : ""
                      }`}
                    >
                      {product.stock || 0} un.
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Estoque;
