import Products from "@components/Products/Products";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.produtos}>
        <header>
          <h2>Produtos</h2>
          <p className="subt">
            Adicione produtos ao carrinho
          </p>
        </header>
        <Products />
      </div>
    </div>
  );
}

export default Home;
