import Card from "@components/Card/Card";
import products from "@data/products.json";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Products.module.css";

function Products() {
  const prods = products;

  return (
    <div className={styles.container}>
      {prods.map((prod) => (
        <Card className={styles.product} classContainer={styles.max}>
          <div className={styles.flex}>
            <div className={`${styles.imgContainer} flex`}>
              <img
                src={prod.src}
                alt={`Não encontramos a imagem de ${prod.name}`}
                className={styles.img}
              />
            </div>
            <div className={styles.desc}>
              <h5>{prod.name}</h5>
              <h4>{handleFormatCoin(prod.price)}</h4>
              <button type="button" className={styles.btnAdd}>
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
