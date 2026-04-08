import { useSelectedProduct } from "@context/SelectedProductProvider";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import CategoryIcon from "@mui/icons-material/Category";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import styles from "./Products.module.css";

function Products({ searchQuery = "" }) {
  const { products, selectedId, setSelectedId, handleInc } =
    useSelectedProduct();

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className={styles.empty}>
        <SearchOffIcon className={styles.emptyIcon} />
        <p>Nenhum produto encontrado</p>
        <span>Tente outro termo de pesquisa</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {filtered.map((prod) => {
        const isLowStock = prod.stock <= prod.minStock;
        const isSelected = selectedId === prod.id;
        const qty = prod.quantity || 0;

        return (
          <div
            key={prod.id}
            className={`${styles.product} ${isSelected ? styles.selected : ""}`}
            onClick={() => setSelectedId(prod.id)}
          >
            <div className={styles.imgWrap}>
              <img src={prod.src} alt={prod.name} className={styles.img} />
              {qty > 0 && <span className={styles.qtyBadge}>{qty}</span>}
            </div>

            <div className={styles.main}>
              <div className={styles.top}>
                <h4 className={styles.name}>{prod.name}</h4>
                <span className={styles.badge}>
                  <CategoryIcon style={{ fontSize: "0.7rem" }} />
                  {prod.categoria}
                </span>
              </div>
              <p className={styles.desc}>{prod.description}</p>
              <div className={styles.stockRow}>
                <span className={isLowStock ? styles.stockLow : styles.stockOk}>
                  {isLowStock ? (
                    <WarningIcon style={{ fontSize: "0.78rem" }} />
                  ) : (
                    <InventoryIcon style={{ fontSize: "0.78rem" }} />
                  )}
                  {isLowStock
                    ? `Baixo estoque · ${prod.stock} un.`
                    : `${prod.stock} em estoque`}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <span className={styles.price}>
                {handleFormatCoin(prod.price)}
              </span>
              <button
                className={styles.btnAdd}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInc(prod.id);
                }}
              >
                <AddShoppingCartIcon style={{ fontSize: "0.95rem" }} />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Products;
