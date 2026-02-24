import { useSelectedProduct } from "@context/SelectedProductProvider";
import Card from "@components/Card/Card";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { getItem } from "@services/storage.js";
import ShoppingCartPlus from "lucide-react/dist/esm/icons/shopping-cart";
import styles from "./Products.module.css";

function Products() {
  const { selectedId, setSelectedId, handleInc } = useSelectedProduct();

  const products = getItem("products") || [];

  return (
    <div className={styles.container}>
      {products.map((prod) => (
        <Card
          key={prod.id}
          className={`${styles.product} ${
            selectedId === prod.id ? styles.selected : ""
          }`}
          classContainer={styles.cardWrapper}
          onClick={() => setSelectedId(prod.id)}
        >
          <div className={styles.imgContainer}>
            <img src={prod.src} alt={prod.name} className={styles.img} />
          </div>

          <div className={styles.desc}>
            <h4>{prod.name}</h4>
            <p className={styles.price}>{handleFormatCoin(prod.price)}</p>

            <button
              type="button"
              className={styles.btnAdd}
              onClick={(e) => {
                e.stopPropagation();
                handleInc();
              }}
            >
              <ShoppingCartPlus size={16} />
              Adicionar
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default Products;
