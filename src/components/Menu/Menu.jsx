import { useState } from "react";
import styles from "./Menu.module.css";

function Menu({ className }) {
  const [qtd, setQtd] = useState(0);
  const finalPrice = 0;

  function handleInc() {
    setQtd(qtd + 1);
  }

  function handleDec() {
    setQtd(qtd - 1);
  }

  return (
    <div className={`${styles.menu} ${className}`}>
      <h3>Prdutos no carrinho</h3>
      <img
        src="/prods/bronzeador.png"
        alt="Imagem de produto para compra"
        className={styles.img}
      />
      <p className={styles.price}>
        <strong>Preço:</strong> 12000KZS
      </p>
      <div className={styles.qtdArea}>
        <label htmlFor="qtd" className={styles.lblQtd}>
          Quantidade
          <div className={`${styles.less} ${styles.btn}`} onClick={handleDec}>
            -
          </div>
          <input type="number" name="qtd" id="qtd" value={qtd} />
          <div className={`${styles.more} ${styles.btn}`} onClick={handleInc}>
            +
          </div>
        </label>
        <p className={styles.finalPrice}>Preço final a pagar: {finalPrice}</p>
      </div>
      <button type="button" className={styles.closeBuy}>
        Finalizar compra
      </button>
    </div>
  );
}

export default Menu;
