import { useState, useMemo, useEffect, useRef } from "react";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@services/firebase";
import Products from "@components/Products/Products";
import Fatura from "@components/Fatura/Fatura";
import { useSelectedProduct } from "@context/SelectedProductProvider";
import useAuth from "@hooks/useAuth";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import {
  updateProducts,
  addVenda,
} from "@services/firebaseData.service.js";
import { showError, showWarning } from "@utils/sweetAlert";
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
  Printer,
  Package,
  Receipt,
} from "lucide-react";
import styles from "./Home.module.css";
import modalStyles from "../Vendas/Modal.module.css";

function Home() {
  const { user } = useAuth()
  const { products, setProducts, handleInc, handleDec, loading: loadingProducts } = useSelectedProduct();

  const [search, setSearch] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [searchCliente, setSearchCliente] = useState("");
  
  // Estado para valor pago e troco
  const [valorPago, setValorPago] = useState("");
  const [troco, setTroco] = useState(0);
  
  // Estado para fatura modal
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [vendaFinalizada, setVendaFinalizada] = useState(null);
  const faturaRef = useRef(null);

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

  const subtotal = carrinho.reduce((acc, i) => acc + i.subtotal, 0);
  const total = subtotal;
  const totalItems = carrinho.reduce((acc, item) => acc + item.qtd, 0);

  // Calcular troco quando valor pago muda
  useEffect(() => {
    const pago = parseFloat(valorPago) || 0;
    const trocoCalc = pago - total;
    setTroco(trocoCalc > 0 ? trocoCalc : 0);
  }, [valorPago, total]);

  async function handleFinalize() {
    if (carrinho.length === 0) {
      showWarning(
        "Carrinho Vazio",
        "Adicione produtos ao carrinho antes de finalizar a venda.",
      );
      return;
    }

    // Validar valor pago para pagamento em dinheiro
    if (formaPagamento === "dinheiro") {
      const pago = parseFloat(valorPago) || 0;
      if (pago < total) {
        showWarning(
          "Valor Insuficiente",
          "O valor pago deve ser igual ou superior ao total da compra.",
        );
        return;
      }
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
          `${p.name}: Solicitado ${p.quantidade}, Estoque minimo ${p.minStock}`,
        ),
      );
      setLoading(false);
      return;
    }

    const subtotalVal = carrinho.reduce((acc, i) => acc + i.subtotal, 0);
    const totalVal = subtotalVal;
    const valorPagoNum = formaPagamento === "dinheiro" ? parseFloat(valorPago) || totalVal : totalVal;
    const trocoVal = formaPagamento === "dinheiro" ? Math.max(0, valorPagoNum - totalVal) : 0;

    const novaVenda = {
      idCompra: Date.now(),
      vendedor: user.nome || user.email || "-",
      vendedorId: user.uid,
      data: new Date().toISOString(),
      pagamento: formaPagamento,
      formaPagamento: formaPagamento,
      clienteId: clienteSelecionado?.id || "indiferente",
      clienteNome: clienteSelecionado?.nome || "Consumidor Final",
      cliente: clienteSelecionado ? {
        nome: clienteSelecionado.nome,
        nif: clienteSelecionado.nif,
        telefone: clienteSelecionado.telefone
      } : null,
      produtos: carrinho.map((item) => ({
        id: item.id,
        name: item.nome,
        quantidade: item.qtd,
        preco: item.preco,
        precoBase: item.precoBase || (item.preco / 1.14),
        iva: item.preco - (item.precoBase || (item.preco / 1.14)),
        preco_pagar: item.subtotal,
      })),
      subtotal: subtotalVal,
      total: totalVal,
      valorPago: valorPagoNum,
      troco: trocoVal,
      status: "concluida",
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

      // Atualiza o caixa do vendedor
      const caixasRef = collection(db, "caixas");
      const caixasSnapshot = await getDocs(caixasRef);
      const caixaAtivo = caixasSnapshot.docs.find((d) => {
        const data = d.data();
        return data.vendedorId === user?.uid && data.status === "aberto";
      });

      if (caixaAtivo) {
        const caixaRef = doc(db, "caixas", caixaAtivo.id);
        await updateDoc(caixaRef, {
          totalVendas: increment(totalVal),
          quantidadeVendas: increment(1),
          // Desconta o troco do fundo de caixa quando aplicavel
          ...(trocoVal > 0 && { valorInicial: increment(-trocoVal) })
        });
      }

      // Mostrar fatura
      setVendaFinalizada({
        ...novaVenda,
        vendedorNome: user.nome || user.email || "-",
      });
      setShowFaturaModal(true);

      setLoading(false);
      setClienteSelecionado(null);
      setSearchCliente("");
      setValorPago("");
      setTroco(0);
    } catch (error) {
      console.error("[v0] Erro ao finalizar venda:", error);
      setLoading(false);
      showError(
        "Erro na Venda",
        "Nao foi possivel finalizar a venda. Tente novamente.",
      );
    }
  }

  const closeFaturaModal = () => {
    setShowFaturaModal(false);
    setVendaFinalizada(null);
  };

  const handlePrintFatura = () => {
    const printContent = faturaRef.current;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Fatura ${vendaFinalizada?.idCompra}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            .fatura { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb; }
            .empresa h1 { margin: 0 0 5px; font-size: 18px; }
            .empresa p { margin: 2px 0; color: #666; font-size: 12px; }
            .faturaInfo { text-align: right; }
            .faturaInfo h2 { margin: 0 0 5px; font-size: 14px; color: #3b82f6; }
            .faturaInfo p { margin: 2px 0; font-size: 12px; }
            .vendedor { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .vendedor p { margin: 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th { background: #f3f4f6; padding: 8px; text-align: left; font-size: 11px; border-bottom: 2px solid #e5e7eb; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
            .totais { display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 20px; }
            .totalRow { display: flex; justify-content: space-between; width: 200px; padding: 5px 0; font-size: 12px; }
            .totalFinal { border-top: 2px solid #333; padding-top: 8px; margin-top: 5px; font-size: 14px; font-weight: bold; }
            .pagamento { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 5px; padding: 10px; margin-bottom: 15px; }
            .notaDevolucao { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 5px; padding: 10px; margin-bottom: 15px; font-size: 10px; color: #78350f; }
            .notaTitulo { font-size: 11px; font-weight: bold; color: #92400e; margin: 0 0 5px; }
            .notaLista { margin: 5px 0; padding-left: 15px; }
            .notaLista li { margin-bottom: 3px; }
            .footer { text-align: center; border-top: 2px dashed #e5e7eb; padding-top: 15px; }
            .footerMessage { font-size: 12px; font-weight: bold; margin: 0 0 5px; }
            .footerSubtext { font-size: 10px; color: #666; margin: 0; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ponto de Venda</h1>
          <p className={styles.subtitle}>
            Registe vendas com agilidade e acompanhe o carrinho em tempo real.
          </p>
        </div>
      </div>

      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <div className={`${styles.overviewIcon} ${styles.iconBlue}`}>
            <Package size={22} />
          </div>
          <div className={styles.overviewContent}>
            <span className={styles.overviewLabel}>Produtos Disponiveis</span>
            <strong className={styles.overviewValue}>{products.length}</strong>
          </div>
        </div>
        <div className={styles.overviewCard}>
          <div className={`${styles.overviewIcon} ${styles.iconGreen}`}>
            <ShoppingCart size={22} />
          </div>
          <div className={styles.overviewContent}>
            <span className={styles.overviewLabel}>Itens no Carrinho</span>
            <strong className={styles.overviewValue}>{totalItems}</strong>
          </div>
        </div>
        <div className={styles.overviewCard}>
          <div className={`${styles.overviewIcon} ${styles.iconPurple}`}>
            <Receipt size={22} />
          </div>
          <div className={styles.overviewContent}>
            <span className={styles.overviewLabel}>Valor do Carrinho</span>
            <strong className={styles.overviewValue}>
              {handleFormatCoin(total)}
            </strong>
          </div>
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
                placeholder="Pesquisar produto por nome ou codigo..."
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
            {loadingProducts ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner} />
                <p>Carregando produtos...</p>
              </div>
            ) : (
              <Products searchQuery={search} />
            )}
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
                <p>O carrinho esta vazio</p>
                <span>Adicione produtos para iniciar uma venda</span>
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
              <label className={styles.paymentLabel}>Identificar Cliente</label>
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
                        placeholder="Pesquisar cliente (nome, tel, NIF)..."
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
                    formaPagamento === "multicaixa" ? styles.paymentActive : ""
                  }`}
                  onClick={() => setFormaPagamento("multicaixa")}
                >
                  <span className={styles.multicaixaIcon}>MCX</span>
                </button>
              </div>
            </div>

            {/* Valor pago e troco - apenas para dinheiro */}
            {formaPagamento === "dinheiro" && carrinho.length > 0 && (
              <div className={styles.trocoSection}>
                <div className={styles.trocoInputGroup}>
                  <label className={styles.paymentLabel}>Valor Recebido</label>
                  <div className={styles.trocoInputWrapper}>
                    <span className={styles.currencySymbol}>Kz</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={valorPago}
                      onChange={(e) => setValorPago(e.target.value)}
                      className={styles.trocoInput}
                    />
                  </div>
                </div>
                <div className={styles.trocoDisplay}>
                  <span className={styles.trocoLabel}>Troco a Devolver</span>
                  <span className={`${styles.trocoValue} ${troco > 0 ? styles.trocoPositivo : ''}`}>
                    {handleFormatCoin(troco)}
                  </span>
                </div>
              </div>
            )}

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

      {/* Modal da Fatura */}
      {showFaturaModal && vendaFinalizada && (
        <div className={modalStyles.overlay} onClick={closeFaturaModal}>
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                Venda Realizada - Fatura #{vendaFinalizada.idCompra}
              </h2>
              <button onClick={closeFaturaModal} className={modalStyles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={modalStyles.content}>
              <Fatura ref={faturaRef} venda={vendaFinalizada} />
            </div>
            <div className={modalStyles.footer}>
              <button
                type="button"
                onClick={closeFaturaModal}
                className={modalStyles.cancelButton}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handlePrintFatura}
                className={modalStyles.submitButton}
              >
                <Printer size={18} />
                Imprimir Fatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
