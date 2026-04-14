import { useSelectedProduct } from "@context/SelectedProductProvider";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { Package, SearchX, Plus } from "lucide-react";
import styles from "./Products.module.css";

function Products({ searchQuery = "" }) {
  const { products, handleInc } = useSelectedProduct();

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      p.code?.includes(searchQuery)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className={styles.empty}>
        <SearchX className={styles.emptyIcon} />
        <p>Nenhum produto encontrado</p>
        <span>Tente outro termo de pesquisa</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {filtered.map((prod) => {
        const qty = prod.quantity || 0;

        return (
          <div
            key={prod.id}
            className={`${styles.product} ${qty > 0 ? styles.selected : ""}`}
            onClick={() => handleInc(prod.id)}
          >
            <div className={styles.imgWrap}>
              {prod.src ? (
                <img src={prod.src} alt={prod.name} className={styles.img} />
              ) : (
                <Package size={32} color="#d1d5db" />
              )}
              {qty > 0 && <span className={styles.qtyBadge}>{qty}</span>}
            </div>

            <div className={styles.productInfo}>
              <h4 className={styles.name}>{prod.name}</h4>
              <div className={styles.meta}>
                <span className={styles.category}>{prod.categoria}</span>
                <span className={styles.code}>{prod.code}</span>
              </div>
              <div className={styles.stockRow}>
                <span
                  className={prod.stock < 10 ? styles.stockLow : styles.stockOk}
                >
                  Estoque: {prod.stock || 0}
                </span>
              </div>
            </div>

            <div className={styles.productFooter}>
              <span className={styles.price}>
                {handleFormatCoin(prod.price)}
              </span>
              <button
                type="button"
                className={styles.addButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInc(prod.id);
                }}
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Products;
