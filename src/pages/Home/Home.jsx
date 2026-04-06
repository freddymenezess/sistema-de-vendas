import Products from "@components/Products/Products";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.produtos}>
        <Products />
      </div>
    </div>
  );
}

export default Home;
