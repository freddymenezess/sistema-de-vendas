import { useEffect, useState } from "react";
import { Package, Search, AlertTriangle } from "lucide-react";
import { getItem } from "@services/storage";
import styles from "./Estoque.module.css";

function Estoque({ className }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalValue = products.reduce(
    (acc, p) => acc + p.price * p.stock,
    0
  );

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <div className={styles.iconWrapper}>
              <Package size={24} />
            </div>
            <div>
              <h1>Gestao de Stock</h1>
              <p>Acompanhe a disponibilidade dos produtos</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pesquisar por nome, codigo ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className={styles.kpiSection}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} data-color="primary">
            <Package size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <span>Total de Produtos</span>
            <strong>{totalProducts}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} data-color="warning">
            <AlertTriangle size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <span>Stock Baixo</span>
            <strong>{lowStockCount}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} data-color="success">
            <Package size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <span>Valor em Stock</span>
            <strong>{totalValue.toLocaleString()} Kz</strong>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className={styles.productsSection}>
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={64} />
            <h3>Nenhum produto encontrado</h3>
            <p>
              {searchTerm
                ? "Tente ajustar os filtros de pesquisa"
                : "Os produtos cadastrados aparecerão aqui"}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.minStock;

              return (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productContent}>
                    <div className={styles.imageBox}>
                      <img src={product.src} alt={product.name} />
                    </div>

                    <div className={styles.productInfo}>
                      <h3>{product.name}</h3>
                      <div className={styles.productMeta}>
                        <span className={styles.code}>Cod: {product.code}</span>
                        <span className={styles.category}>{product.categoria}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.productFooter}>
                    <div className={styles.priceArea}>
                      <span className={styles.priceLabel}>Preco</span>
                      <span className={styles.price}>{product.price.toLocaleString()} Kz</span>
                    </div>

                    <div className={styles.stockArea}>
                      <span className={styles.stockLabel}>Stock</span>
                      <span className={`${styles.stockValue} ${isLowStock ? styles.lowStock : ""}`}>
                        {product.stock} un.
                        {isLowStock && (
                          <span className={styles.warningBadge}>
                            <AlertTriangle size={12} />
                            Baixo
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Estoque;
