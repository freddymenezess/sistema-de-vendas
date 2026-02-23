import { useSelectedProduct } from "@context/SelectedProductProvider";
import { useState, useEffect } from "react";
import { getItem, setItem } from "@services/storage.js";
import styles from "./Menu.module.css";

function Menu({ className }) {
  const { products, selectedId, qtd, setQtd, handleInc, handleDec } =
    useSelectedProduct();
  const prod = products.find((prod) => prod.id == selectedId);
  const [venda, setVenda] = useState([]);

  useEffect(() => {
    const existingItem = venda.find((item) => item.id === selectedId);
    setQtd(existingItem ? existingItem.quantidade : 0);
  }, [selectedId]);
  useEffect(() => {
    setVenda((prevVenda) => {
      const vendaArray = Array.isArray(prevVenda) ? prevVenda : [];
      const existingIndex = vendaArray.findIndex((item) => item.id === prod.id);

      if (qtd === 0) {
        return vendaArray.filter((item) => item.id !== prod.id);
      }

      const newItem = {
        id: prod.id,
        nome: prod.nome,
        preço: prod.price,
        quantidade: qtd,
        preco_pagar: prod.price * qtd,
      };

      if (existingIndex !== -1) {
        const updated = [...vendaArray];
        updated[existingIndex] = newItem;
        return updated;
      } else {
        return [...vendaArray, newItem];
      }
    });
  }, [prod, qtd]);

  function handleReset() {
    setQtd(0);
    setVenda((prevVenda) => prevVenda.filter((item) => item.id !== prod.id));
  }

  function handleFinalize() {
    const comprasAnteriores = getItem("compras") || [];
    const novaCompra = {
      idCompra: Date.now(),
      data: new Date().toISOString(),
      produtos: venda,
      total: venda.reduce((acc, item) => acc + item.preco_pagar, 0),
    };

    setItem("compras", [...comprasAnteriores, novaCompra]);

    setVenda([]);
    setQtd(1);

    alert("Compra finalizada e salva!");
  }

  const finalPrice = venda.reduce((acc, item) => acc + item.preco_pagar, 0);

  return (
    <div className={`${styles.menu} ${className} flex`}>
      <div className={styles.main}>
        <h3>Produtos no carrinho</h3>
        <img
          src={prod.src}
          alt="Imagem de produto para compra"
          className={styles.img}
        />
        <p className={styles.price}>
          <strong>Preço:</strong> {prod.price}
        </p>
        <div className={styles.qtdArea}>
          <label htmlFor="qtd" className={styles.lblQtd}>
            Quantidade
            <div className={`${styles.less} ${styles.btn}`} onClick={handleDec}>
              -
            </div>
            <input
              type="number"
              name="qtd"
              id="qtd"
              value={qtd}
              onChange={(e) => setQtd(Number(e.target.value))}
            />
            <div className={`${styles.more} ${styles.btn}`} onClick={handleInc}>
              +
            </div>
          </label>
          <p className={styles.finalPrice}>
            Preço final do carrinho: {finalPrice}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", width: "100%" }}>
        <button
          type="button"
          className={styles.closeBuy}
          onClick={handleReset}
        >
          Resetar produto
        </button>
        <button
          type="button"
          className={styles.closeBuy}
          onClick={handleFinalize}
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}

export default Menu;
