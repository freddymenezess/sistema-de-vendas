import { useSelectedProduct } from "@context/SelectedProductProvider";
import { useState, useEffect } from "react";
import styles from "./Menu.module.css";

function Menu({ className }) {
  const { products, selectedId } = useSelectedProduct();
  const prod = products.find((prod) => prod.id == selectedId);
  const [qtd, setQtd] = useState(0);
  const [venda, setVenda] = useState([]);

  // Quando muda o produto selecionado, zera a quantidade local
  useEffect(() => {
    const existingItem = venda.find((item) => item.id === selectedId);
    setQtd(existingItem ? existingItem.quantidade : 0);
  }, [selectedId]);

  // Atualiza o carrinho sempre que a quantidade mudar
  useEffect(() => {
    setVenda((prevVenda) => {
      const vendaArray = Array.isArray(prevVenda) ? prevVenda : [];
      const existingIndex = vendaArray.findIndex((item) => item.id === prod.id);

      if (qtd === 0) {
        // Remove produto se qtd = 0
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

  function handleInc() {
    setQtd(qtd + 1);
  }

  function handleDec() {
    if (qtd > 0) setQtd(qtd - 1);
  }

  // Função para resetar a quantidade do produto atual
  function handleReset() {
    setQtd(0); // volta para quantidade inicial
    setVenda((prevVenda) => prevVenda.filter((item) => item.id !== prod.id)); // remove do carrinho
  }

  function handleFinalize() {
    // Pega as compras anteriores do localStorage
    const comprasAnteriores = localStorage.getItem("compras") || [];

    // Adiciona a nova compra
    const novaCompra = {
      idCompra: Date.now(), // ID único para a compra
      data: new Date().toISOString(),
      produtos: venda,
      total: venda.reduce((acc, item) => acc + item.preco_pagar, 0),
    };

    // Salva de volta no localStorage
    localStorage.setItem(
      "compras",
      [...comprasAnteriores, novaCompra],
    );

    // Limpa carrinho e quantidade
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
        <button type="button" className={styles.closeBuy} onClick={handleReset}>
          Resetar produto
        </button>
        <button type="button" className={styles.closeBuy} onClick={handleFinalize}>
          Finalizar compra
        </button>
      </div>
    </div>
  );
}

export default Menu;
