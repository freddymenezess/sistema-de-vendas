import { useState, useEffect } from "react";
import Products from "@components/Products/Products";
import { useSelectedProduct } from "@context/SelectedProductProvider";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { getItem, setItem } from "@services/storage.js";
import { showAlert } from "@components/Alerts";
import SearchIcon from "@mui/icons-material/Search";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaidIcon from "@mui/icons-material/Paid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import DiscountIcon from "@mui/icons-material/Discount";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import styles from "./Home.module.css";

const PAYMENT_METHODS = [
  { id: "card", label: "Cartão", icon: CreditCardIcon },
  { id: "cash", label: "Dinheiro", icon: PaidIcon },
];

function Home() {
  const { products, setProducts, handleInc, handleDec } = useSelectedProduct();

  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("card");
  const [discount, setDiscount] = useState("");
  const [venda, setVenda] = useState([]);

  // Derive cart from products that have quantity > 0
  useEffect(() => {
    const newVenda = products
      .filter((p) => (p.quantity || 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        src: p.src,
        preco: p.price,
        quantidade: p.quantity,
        preco_pagar: p.price * p.quantity,
      }));
    setVenda(newVenda);
  }, [products]);

  function handleRemove(id) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: 0 } : p)),
    );
  }

  function handleReset() {
    setProducts((prev) => prev.map((p) => ({ ...p, quantity: 0 })));
    setVenda([]);
    setDiscount("");
  }

  function handleFinalize() {
    if (venda.length === 0) return;

    // Validate stock minimums
    const stockErrors = venda.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.id);
      if (prod && prod.stock - item.quantidade < prod.minStock) {
        acc.push({ ...prod, quantidade: item.quantidade });
      }
      return acc;
    }, []);

    if (stockErrors.length > 0) {
      stockErrors.forEach((p) =>
        showAlert(
          `${p.name}: Solicitado ${p.quantidade}, Estoque mínimo ${p.minStock}`,
          "error",
        ),
      );
      return;
    }

    const subtotalVal = venda.reduce((acc, i) => acc + i.preco_pagar, 0);
    const discountPct = parseFloat(discount) || 0;
    const totalVal = subtotalVal * (1 - discountPct / 100);

    const novaCompra = {
      idCompra: Date.now(),
      data: new Date().toISOString(),
      pagamento: payment,
      desconto: discountPct,
      produtos: venda,
      subtotal: subtotalVal,
      total: totalVal,
    };

    // Deduct stock and reset quantities
    const newProds = products.map((prod) => {
      const vendido = venda.find((v) => v.id === prod.id);
      return vendido
        ? { ...prod, stock: prod.stock - vendido.quantidade, quantity: 0 }
        : prod;
    });

    setItem("products", newProds);
    setProducts(newProds.map((p) => ({ ...p, quantity: 0 })));
    setItem("compras", [...(getItem("compras") || []), novaCompra]);
    setVenda([]);
    setDiscount("");
    showAlert("Compra finalizada com sucesso!", "success");
  }

  const subtotal = venda.reduce((acc, i) => acc + i.preco_pagar, 0);
  const discountPct = parseFloat(discount) || 0;
  const discountAmount = subtotal * (discountPct / 100);
  const total = subtotal - discountAmount;
  const totalItems = venda.reduce((a, i) => a + i.quantidade, 0);

  return (
    <div className={styles.layout}>
      {/* ── LEFT — CATALOG ── */}
      <section className={styles.catalog}>
        <header className={styles.catalogHeader}>
          <div className={styles.brand}>
            <PointOfSaleIcon />
            <span>PDV</span>
          </div>
          <div className={styles.searchBox}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pesquisar produto, código ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </header>

        <div className={styles.catalogBody}>
          <Products searchQuery={search} />
        </div>
      </section>

      {/* ── RIGHT — ORDER PANEL ── */}
      <aside className={styles.orderPanel}>
        <div className={styles.orderHeader}>
          <ReceiptLongIcon />
          <h2>Pedido Atual</h2>
          {totalItems > 0 && (
            <span className={styles.itemCount}>{totalItems} itens</span>
          )}
        </div>

        {/* Cart items */}
        <div className={styles.cartList}>
          {venda.length === 0 ? (
            <div className={styles.emptyCart}>
              <ReceiptLongIcon className={styles.emptyIcon} />
              <p>Nenhum item adicionado</p>
              <span>Selecione produtos no catálogo</span>
            </div>
          ) : (
            venda.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img
                  src={item.src}
                  alt={item.name}
                  className={styles.cartImg}
                />
                <div className={styles.cartInfo}>
                  <p className={styles.cartName}>{item.name}</p>
                  <span className={styles.cartUnit}>
                    {handleFormatCoin(item.preco)} / un.
                  </span>
                </div>
                <div className={styles.qtyControl}>
                  <button onClick={() => handleDec(item.id)}>
                    <RemoveIcon fontSize="small" />
                  </button>
                  <input
                    type="number"
                    value={item.quantidade}
                    min={0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === item.id ? { ...p, quantity: val } : p,
                        ),
                      );
                    }}
                  />
                  <button onClick={() => handleInc(item.id)}>
                    <AddIcon fontSize="small" />
                  </button>
                </div>
                <div className={styles.cartItemTotal}>
                  {handleFormatCoin(item.preco_pagar)}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(item.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Payment method */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Método de Pagamento</p>
          <div className={styles.paymentGrid}>
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`${styles.payBtn} ${payment === id ? styles.payActive : ""}`}
                onClick={() => setPayment(id)}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Discount */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Desconto</p>
          <div className={styles.discountRow}>
            <div className={styles.discountInput}>
              <DiscountIcon fontSize="small" />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <span>%</span>
            </div>
            {discountAmount > 0 && (
              <span className={styles.discountSaved}>
                − {handleFormatCoin(discountAmount)}
              </span>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{handleFormatCoin(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className={`${styles.totalRow} ${styles.totalDiscount}`}>
              <span>Desconto ({discountPct}%)</span>
              <span>− {handleFormatCoin(discountAmount)}</span>
            </div>
          )}
          <div className={styles.totalFinal}>
            <span>Total</span>
            <span>{handleFormatCoin(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.checkoutActions}>
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={venda.length === 0}
          >
            <RestartAltIcon fontSize="small" />
            Resetar
          </button>
          <button
            className={styles.checkoutBtn}
            onClick={handleFinalize}
            disabled={venda.length === 0}
          >
            <ShoppingCartCheckoutIcon fontSize="small" />
            Finalizar Venda
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Home;
