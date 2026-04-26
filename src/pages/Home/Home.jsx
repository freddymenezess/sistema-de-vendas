import { useState, useMemo, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@services/firebase";
import Products from "@components/Products/Products";
import { useSelectedProduct } from "@context/SelectedProductProvider";
import useAuth from "@hooks/useAuth";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import {
  updateProducts,
  addVenda,
} from "@services/firebaseData.service.js";
import { showSuccess, showError, showWarning } from "@utils/sweetAlert";
import {
  Search,
  CreditCard,
  Banknote,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  X,
  User,
  UserCheck,
} from "lucide-react";
import styles from "./Home.module.css";

function Home() {
  const { user } = useAuth()
  const { products, setProducts, handleInc, handleDec } = useSelectedProduct();

  const [search, setSearch] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [searchCliente, setSearchCliente] = useState("");

  // Carregar clientes do Firebase
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "clientes"));
        const clientesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientes(clientesData);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };
    loadClientes();
  }, []);

  // Filtrar clientes pela busca
  const clientesFiltrados = useMemo(() => {
    if (!searchCliente) return clientes.slice(0, 5);
    return clientes
      .filter(
        (c) =>
          c.nome?.toLowerCase().includes(searchCliente.toLowerCase()) ||
          c.telefone?.includes(searchCliente) ||
          c.nif?.includes(searchCliente),
      )
      .slice(0, 5);
  }, [clientes, searchCliente]);

  const carrinho = useMemo(
    () =>
      products
        .filter((p) => (p.quantity || 0) > 0)
        .map((p) => ({
          id: p.id,
          nome: p.name,
          src: p.src,
          preco: p.price,
          qtd: p.quantity,
          subtotal: p.price * p.quantity,
        })),
    [products],
  );

  function handleRemove(id) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: 0 } : p)),
    );
  }

  function handleClearCart() {
    setProducts((prev) => prev.map((p) => ({ ...p, quantity: 0 })));
  }

  async function handleFinalize() {
    if (carrinho.length === 0) {
      showWarning(
        "Carrinho Vazio",
        "Adicione produtos ao carrinho antes de finalizar a venda.",
      );
      return;
    }

    setLoading(true);

    // Validate stock minimums
    const stockErrors = carrinho.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.id);
      if (prod && prod.stock - item.qtd < prod.minStock) {
        acc.push({ ...prod, quantidade: item.qtd });
      }
      return acc;
    }, []);

    if (stockErrors.length > 0) {
      stockErrors.forEach((p) =>
        showError(
          "Estoque Insuficiente",
          `${p.name}: Solicitado ${p.quantidade}, Estoque mínimo ${p.minStock}`,
        ),
      );
      setLoading(false);
      return;
    }

    const subtotalVal = carrinho.reduce((acc, i) => acc + i.subtotal, 0);
    const totalVal = subtotalVal;

    const novaVenda = {
      idCompra: Date.now(),
      vendedor: user.nome || user.email || "-",
      data: new Date().toISOString(),
      pagamento: formaPagamento,
      clienteId: clienteSelecionado?.id || "indiferente",
      clienteNome: clienteSelecionado?.nome || "Consumidor Final",
      produtos: carrinho.map((item) => ({
        id: item.id,
        name: item.nome,
        quantidade: item.qtd,
        preco: item.preco,
        preco_pagar: item.subtotal,
      })),
      subtotal: subtotalVal,
      total: totalVal,
    };

    // Deduct stock and reset quantities
    const newProds = products.map((prod) => {
      const vendido = carrinho.find((v) => v.id === prod.id);
      return vendido
        ? { ...prod, stock: prod.stock - vendido.qtd, quantity: 0 }
        : prod;
    });

    try {
      // Atualiza produtos no Firebase
      await updateProducts(newProds);
      setProducts(newProds.map((p) => ({ ...p, quantity: 0 })));

      // Adiciona venda no Firebase
      await addVenda(novaVenda);

      setLoading(false);
      setClienteSelecionado(null);
      setSearchCliente("");
      showSuccess("Venda Finalizada!", "Sua venda foi registrada com sucesso.");
    } catch (error) {
      console.error("[v0] Erro ao finalizar venda:", error);
      setLoading(false);
      showError(
        "Erro na Venda",
        "Não foi possível finalizar a venda. Tente novamente.",
      );
    }
  }

  const subtotal = carrinho.reduce((acc, i) => acc + i.subtotal, 0);
  const total = subtotal;
  const totalItems = carrinho.reduce((acc, item) => acc + item.qtd, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ponto de Venda</h1>
          <p className={styles.subtitle}>
            Registre vendas com agilidade e acompanhe o carrinho em tempo real.
          </p>
        </div>
      </div>

      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Produtos disponíveis</span>
          <strong className={styles.overviewValue}>{products.length}</strong>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Itens no carrinho</span>
          <strong className={styles.overviewValue}>{totalItems}</strong>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Valor do carrinho</span>
          <strong className={styles.overviewValue}>
            {handleFormatCoin(total)}
          </strong>
        </div>
      </div>

      <div className={styles.pdvLayout}>
        {/* Products Section */}
        <div className={styles.productsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Produtos</h2>
              <p className={styles.sectionSubtitle}>
                Selecione o produto e adicione ao carrinho com rapidez.
              </p>
            </div>
          </div>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar produto por nome ou codigo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearch("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.productsList}>
            <Products searchQuery={search} />
          </div>
        </div>

        {/* Cart Section */}
        <div className={styles.cartSection}>
          <div className={styles.cartHeader}>
            <h2 className={styles.cartTitle}>
              <ShoppingCart size={20} />
              Carrinho
              {carrinho.length > 0 && (
                <span className={styles.cartBadge}>{carrinho.length}</span>
              )}
            </h2>
            {carrinho.length > 0 && (
              <button onClick={handleClearCart} className={styles.clearButton}>
                Limpar
              </button>
            )}
          </div>

          <div className={styles.cartItems}>
            {carrinho.length === 0 ? (
              <div className={styles.cartEmpty}>
                <ShoppingCart size={48} className={styles.cartEmptyIcon} />
                <p>Carrinho vazio</p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemName}>{item.nome}</div>
                    <div className={styles.cartItemPrice}>
                      {handleFormatCoin(item.preco)}
                    </div>
                  </div>
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleDec(item.id)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.quantity}>{item.qtd}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleInc(item.id)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className={styles.cartItemTotal}>
                    {handleFormatCoin(item.subtotal)}
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.cartTotals}>
              <div className={styles.cartRow}>
                <span>Subtotal</span>
                <span>{handleFormatCoin(subtotal)}</span>
              </div>
              <div className={`${styles.cartRow} ${styles.cartRowTotal}`}>
                <span>Total</span>
                <span>{handleFormatCoin(total)}</span>
              </div>
            </div>

            <div className={styles.customerSection}>
              <label className={styles.paymentLabel}>Identificar Comprador</label>
              <div className={styles.customerSearchWrapper}>
                {clienteSelecionado ? (
                  <div className={styles.selectedCustomer}>
                    <div className={styles.customerInfo}>
                      <div className={styles.customerAvatar}>
                        <UserCheck size={18} />
                      </div>
                      <div className={styles.customerDetails}>
                        <span className={styles.customerName}>{clienteSelecionado.nome}</span>
                        <span className={styles.customerSub}>
                          {clienteSelecionado.telefone || clienteSelecionado.nif || "Cliente Identificado"}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setClienteSelecionado(null)}
                      className={styles.removeCustomer}
                      title="Remover cliente"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.customerInputContainer}>
                    <div className={styles.customerInputWrapper}>
                      <User size={18} className={styles.searchIcon} />
                      <input
                        type="text"
                        placeholder="Buscar cliente (nome, tel, NIF)..."
                        value={searchCliente}
                        onChange={(e) => {
                          setSearchCliente(e.target.value);
                          setShowClienteDropdown(true);
                        }}
                        onFocus={() => setShowClienteDropdown(true)}
                        className={styles.customerInput}
                      />
                    </div>
                    {showClienteDropdown && searchCliente && (
                      <div className={styles.customerDropdown}>
                        {clientesFiltrados.map((c) => (
                          <div
                            key={c.id}
                            className={styles.dropdownItem}
                            onClick={() => {
                              setClienteSelecionado(c);
                              setSearchCliente("");
                              setShowClienteDropdown(false);
                            }}
                          >
                            <div className={styles.dropdownItemInfo}>
                              <strong>{c.nome}</strong>
                              <span>{c.telefone || c.nif || ""}</span>
                            </div>
                          </div>
                        ))}
                        {clientesFiltrados.length === 0 && (
                          <div className={styles.noResults}>Nenhum cliente encontrado</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.paymentSection}>
              <label className={styles.paymentLabel}>Forma de Pagamento</label>
              <div className={styles.paymentOptions}>
                <button
                  className={`${styles.paymentOption} ${
                    formaPagamento === "dinheiro" ? styles.paymentActive : ""
                  }`}
                  onClick={() => setFormaPagamento("dinheiro")}
                >
                  <Banknote size={20} />
                  <span>Dinheiro</span>
                </button>
                <button
                  className={`${styles.paymentOption} ${
                    formaPagamento === "cartao_credito"
                      ? styles.paymentActive
                      : ""
                  }`}
                  onClick={() => setFormaPagamento("cartao_credito")}
                >
                  <CreditCard size={20} />
                  <span>Credito</span>
                </button>
                <button
                  className={`${styles.paymentOption} ${
                    formaPagamento === "cartao_debito"
                      ? styles.paymentActive
                      : ""
                  }`}
                  onClick={() => setFormaPagamento("cartao_debito")}
                >
                  <CreditCard size={20} />
                  <span>Debito</span>
                </button>
                <button
                  className={`${styles.paymentOption} ${
                    formaPagamento === "pix" ? styles.paymentActive : ""
                  }`}
                  onClick={() => setFormaPagamento("pix")}
                >
                  <span className={styles.pixIcon}>PIX</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleFinalize}
              disabled={carrinho.length === 0 || loading}
              className={styles.checkoutButton}
            >
              {loading ? "Processando..." : "Finalizar Venda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
