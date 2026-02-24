import { useSelectedProduct } from "@context/SelectedProductProvider";
import { useState, useEffect } from "react";
import { getItem, setItem } from "@services/storage.js";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import SimpleAlert from "@components/SimpleAlert";

import styles from "./Menu.module.css";

function Menu({ className = "" }) {
  const {
    products,
    selectedId,
    qtd,
    setQtd,
    handleInc,
    handleDec
  } = useSelectedProduct();
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const prod = products.find((prod) => prod.id == selectedId);
  const [venda, setVenda] = useState([]);

  useEffect(() => {
    const existingItem = venda.find((item) => item.id === selectedId);
    setQtd(existingItem ? existingItem.quantidade : 0);
  }, [selectedId]);

  useEffect(() => {
    if (!prod) return;

    setVenda((prevVenda) => {
      const vendaArray = Array.isArray(prevVenda) ? prevVenda : [];
      const existingIndex = vendaArray.findIndex((item) => item.id === prod.id);

      if (qtd === 0) {
        return vendaArray.filter((item) => item.id !== prod.id);
      }

      const newItem = {
        id: prod.id,
        name: prod.name,
        preco: prod.price,
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
    setVenda((prevVenda) => prevVenda.filter((item) => item.id !== prod?.id));
  }

  function handleFinalize() {
    if (venda.length === 0) return;

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

    setAlert({
      open: true,
      message: "Compra finalizada com sucesso!",
      severity: "success",
    });

    setTimeout(() => {
      setAlert((prev) => ({ ...prev, open: false }));
    }, 3000);
  }

  const finalPrice = venda.reduce((acc, item) => acc + item.preco_pagar, 0);

  if (!prod) return null;

  return (
    <div className={`${styles.menu} ${className}`}>
      {/* PRODUTO */}
      <div className={styles.productCard}>
        <img src={prod.src} alt="Produto" className={styles.img} />

        <div className={styles.productInfo}>
          <h3>{prod.name}</h3>
          <p className={styles.price}>Kz {prod.price}</p>

          <div className={styles.qtdControl}>
            <button onClick={handleDec}>
              <RemoveIcon fontSize="small" />
            </button>

            <input
              type="number"
              value={qtd}
              onChange={(e) => setQtd(Number(e.target.value))}
            />

            <button onClick={handleInc}>
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* RESUMO */}
      <div className={styles.summary}>
        <h4>Carrinho</h4>

        <div className={styles.cartList}>
          {venda.length === 0 && (
            <p className={styles.empty}>Nenhum produto adicionado</p>
          )}

          {venda.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div>
                <strong>{item.name}</strong>
              </div>

              <div className={styles.itemRight}>
                <span>{item.quantidade}x</span>
                <span>Kz {item.preco_pagar}</span>
                <DeleteOutlineIcon
                  className={styles.removeIcon}
                  onClick={handleReset}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.total}>
          <span>Total</span>
          <strong>Kz {finalPrice}</strong>
        </div>

        <div className={styles.actions}>
          <button className={styles.reset} onClick={handleReset}>
            Resetar
          </button>

          <button className={styles.finalize} onClick={handleFinalize}>
            <ShoppingCartCheckoutIcon fontSize="small" />
            Finalizar Compra
          </button>
        </div>
      </div>
      <SimpleAlert
        left={20}
        right={""}
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={() =>
          setAlert((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}

export default Menu;
