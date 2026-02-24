import Products from "@components/Products/Products";
import Card from "@components/Card/Card";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.produtos}>
        <header>
          <h2>Produtos</h2>
          <p className="subt">Adicione, edite e organize os produtos disponíveis</p>
        </header>
        <Products />
      </div>
    </div>
  );
}

export default Home;
