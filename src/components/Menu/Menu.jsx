import { useSelectedProduct } from "@context/SelectedProductProvider";
import { useEffect, useState } from "react";
import { getItem, setItem } from "@services/storage.js";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { showAlert } from "@components/Alerts";
import { showConfirm } from "@utils/sweetAlert";

import styles from "./Menu.module.css";

function Menu({ className = "" }) {
  const { products, setProducts, selectedId, handleInc, handleDec } =
    useSelectedProduct();

  const prod = products.find((prod) => prod.id == selectedId);
  const [venda, setVenda] = useState([]);

  useEffect(() => {
    const newVenda = products
      .filter((p) => (p.quantity || 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        preco: p.price,
        quantidade: p.quantity,
        preco_pagar: p.price * p.quantity,
      }));
    setVenda(newVenda);
  }, [products]);

  function handleRemove(id) {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === id ? { ...p, quantity: 0 } : p)),
    );
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

    const verStock = venda.reduce((acc, vend) => {
      const prod = products.find((p) => p.id === vend.id);

      if (prod && prod.stock - vend.quantidade < prod.minStock) {
        acc.push({
          id: prod.id,
          name: prod.name,
          quantidade: vend.quantidade,
          minStock: prod.minStock,
        });
      }

      return acc;
    }, []);

    if (verStock.length > 0) {
      verStock.forEach((item) => {
        showAlert(
          `${item.name}: Solicitado ${item.quantidade}, Estoque mínimo ${item.minStock}`,
          "error",
        );
      });
      return;
    }

    const newProds = products.map((prod) => {
      const vendido = venda.find((vend) => vend.id === prod.id);

      if (vendido) {
        return {
          ...prod,
          stock: prod.stock - vendido.quantidade,
        };
      }

      return prod;
    });

    setItem("products", newProds);
    setProducts(newProds);
    setItem("compras", [...comprasAnteriores, novaCompra]);

    // Resetar quantities após finalizar
    setProducts((prevProducts) =>
      prevProducts.map((p) => ({ ...p, quantity: 0 })),
    );

    setVenda([]);
    // Remover setQtd(1), pois quantity é por produto

    showAlert("Compra finalizada com sucesso!", "success");
  }

  function handleReset() {
    showConfirm(
      "Limpar carrinho?",
      "Tem certeza que deseja remover todos os itens do carrinho?",
      "Sim, limpar",
    ).then((result) => {
      if (result.isConfirmed) {
        setProducts((prevProducts) =>
          prevProducts.map((p) => ({ ...p, quantity: 0 })),
        );
        setVenda([]);
      }
    });
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
          <p className={styles.price}>{handleFormatCoin(prod.price)}</p>

          <div className={styles.qtdControl}>
            <button onClick={() => handleDec(prod.id)}>
              <RemoveIcon fontSize="small" />
            </button>

            <input
              type="number"
              value={prod.quantity || 0}
              onChange={(e) => {
                const newQtd = Number(e.target.value);
                setProducts((prevProducts) =>
                  prevProducts.map((p) =>
                    p.id === prod.id ? { ...p, quantity: newQtd } : p,
                  ),
                );
              }}
            />

            <button onClick={() => handleInc(prod.id)}>
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
                <span>-</span>
                <span>{handleFormatCoin(item.preco_pagar)}</span>
                <DeleteOutlineIcon
                  className={styles.removeIcon}
                  onClick={() => handleRemove(item.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.total}>
          <span>Total</span>
          <strong>{handleFormatCoin(finalPrice)}</strong>
        </div>

        <div className={styles.actions}>
          <button className={styles.reset} onClick={() => handleReset()}>
            Resetar
          </button>

          <button className={styles.finalize} onClick={handleFinalize}>
            <ShoppingCartCheckoutIcon fontSize="small" />
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;
