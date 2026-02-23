import { useSelectedProduct } from "@context/SelectedProductProvider";
import Card from "@components/Card/Card";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { getItem } from "@services/storage.js"
import styles from "./Products.module.css";

function Products() {
  const { selectedId, setSelectedId, handleInc } = useSelectedProduct();
  const products = getItem("products");

  return (
    <div className={styles.container}>
      {products.map((prod) => (
        <Card
          key={prod.id}
          className={`${styles.product} ${selectedId === prod.id ? styles.selected : ""}`}
          classContainer={styles.max}
          onClick={() => setSelectedId(prod.id)}
        >
          <div className={styles.flex}>
            <div className={`${styles.imgContainer} flex`}>
              <img
                src={prod.src}
                alt="Não encontramos a imagem deste produto"
                className={styles.img}
              />
            </div>
            <div className={styles.desc}>
              <h5>{prod.name}</h5>
              <h4>{handleFormatCoin(prod.price)}</h4>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={handleInc}
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default Products;
