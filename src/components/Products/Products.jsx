import { useSelectedProduct } from "../../context/SelectedProductProvider";
import { handleFormatCoin } from "../../utils/handleFormatCoin";
import { getItem } from "../../services/storage";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CategoryIcon from "@mui/icons-material/Category";
import WarningIcon from "@mui/icons-material/Warning";
import styles from "./Products.module.css";

function Products() {
  const { selectedId, setSelectedId, handleInc } = useSelectedProduct();

  const products = getItem("products") || [];

  return (
    <div className={styles.container}>
      {products.map((prod) => {
        const isLowStock = prod.stock <= prod.minStock;

        return (
          <div
            key={prod.id}
            className={`${styles.product} ${
              selectedId === prod.id ? styles.selected : ""
            }`}
            onClick={() => setSelectedId(prod.id)}
          >
            <div className={styles.imgContainer}>
              <img src={prod.src} alt={prod.name} className={styles.img} />
            </div>

            <div className={styles.desc}>
              <div className={styles.titleRow}>
                <h4>{prod.name}</h4>
                <span className={styles.badge}>
                  <CategoryIcon fontSize="small" />
                  {prod.categoria}
                </span>
              </div>

              <p className={styles.description}>{prod.description}</p>

              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <InventoryIcon fontSize="small" />
                  {prod.stock} em estoque
                </span>

                {isLowStock ? (
                  <span className={styles.lowStock}>
                    <WarningIcon fontSize="small" />
                    Estoque baixo
                  </span>
                ) : (
                  <span className={styles.metaItem}>
                    <CheckCircleIcon fontSize="small" />
                    Mínimo {prod.minStock}
                  </span>
                )}
              </div>

              <div className={styles.footer}>
                <span className={styles.price}>
                  {handleFormatCoin(prod.price)}
                </span>

                <button
                  type="button"
                  className={styles.btnAdd}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInc(prod.id);
                  }}
                >
                  <AddShoppingCartIcon fontSize="small" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Products;
