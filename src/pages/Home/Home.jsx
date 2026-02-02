import Products from "@components/Products/Products";
import Card from "@components/Card/Card";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.produtos}>
        <h2>Produtos</h2>
        <Products />
      </div>
    </div>
  );
}

export default Home;
