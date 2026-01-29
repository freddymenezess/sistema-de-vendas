import { useState } from "react";
import Products from "@components/Products/Products";
import Menu from "@components/Menu/Menu"
import Card from "@components/Card/Card";
import styles from "./Home.module.css";

function Home() {
  const [focus, setFocus] = useState(false);

  return (
    <div className={styles.grade}>
      <div className={styles.col1}>
        <div className={styles.pesquisa}>
          <h2>Pesquise por um produto</h2>
          <Card className={styles.card}>
            <form className={`${styles.form} flex`}>
              <label>
                <input
                  type="search"
                  placeholder="Insira o nome do produto"
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                />
              </label>
              <button
                type="button"
                className={`${styles.btn} ${focus ? styles.btnFocus : ""}`}
              >
                Pesquisar
              </button>
            </form>
          </Card>
        </div>
        <div className={styles.produtos}>
          <h2>Produtos</h2>
          <Products />
        </div>
      </div>
    </div>
  );
}

export default Home;
