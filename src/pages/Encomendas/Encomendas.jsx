import { useState, useEffect, useRef } from "react";
import { Plus, X, Printer, Package, AlertTriangle, Truck } from "lucide-react";
import { getProducts } from "@services/firebaseData.service.js";
import { getFornecedores } from "@services/firebaseData.service.js";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@services/firebase";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Encomendas.module.css";
import modalStyles from "./Modal.module.css";

function Encomendas() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [encomendas, setEncomendas] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedEncomenda, setSelectedEncomenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  const [formData, setFormData] = useState({
    fornecedorId: "",
    itens: [],
    observacoes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, fornecedoresData, encomendasSnapshot] = await Promise.all([
        getProducts(),
        getFornecedores(),
        getDocs(collection(db, "encomendas")),
      ]);

      setProdutos(productsData);
      setFornecedores(fornecedoresData);

      const encomendasData = encomendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEncomendas(encomendasData);

      // Filtrar produtos com stock baixo
      const lowStock = productsData.filter(
        (p) => p.minStock > 0 && (p.quantidade || 0) <= p.minStock
      );
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("[v0] Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormData({
      fornecedorId: "",
      itens: lowStockProducts.map((p) => ({
        produtoId: p.id,
        nome: p.name,
        quantidadeAtual: p.quantidade || 0,
        minStock: p.minStock || 0,
        quantidadeEncomendar: Math.max(0, (p.minStock || 0) * 2 - (p.quantidade || 0)),
        precoCusto: p.precoCusto || 0,
      })),
      observacoes: "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleItemQuantityChange = (index, value) => {
    const newItens = [...formData.itens];
    newItens[index].quantidadeEncomendar = parseInt(value) || 0;
    setFormData({ ...formData, itens: newItens });
  };

  const removeItem = (index) => {
    const newItens = formData.itens.filter((_, i) => i !== index);
    setFormData({ ...formData, itens: newItens });
  };

  const addItem = (produto) => {
    const exists = formData.itens.find((i) => i.produtoId === produto.id);
    if (exists) return;

    const newItem = {
      produtoId: produto.id,
      nome: produto.name,
      quantidadeAtual: produto.quantidade || 0,
      minStock: produto.minStock || 0,
      quantidadeEncomendar: 10,
      precoCusto: produto.precoCusto || 0,
    };

    setFormData({ ...formData, itens: [...formData.itens, newItem] });
  };

  const calcularTotal = () => {
    return formData.itens.reduce(
      (acc, item) => acc + item.quantidadeEncomendar * item.precoCusto,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itensValidos = formData.itens.filter((i) => i.quantidadeEncomendar > 0);
    if (itensValidos.length === 0) {
      alert("Adicione pelo menos um item com quantidade maior que zero.");
      return;
    }

    const fornecedor = fornecedores.find((f) => f.id === formData.fornecedorId);

    const encomendaData = {
      fornecedorId: formData.fornecedorId,
      fornecedorNome: fornecedor?.nome || "Não especificado",
      itens: itensValidos,
      observacoes: formData.observacoes,
      total: calcularTotal(),
      status: "pendente",
      createdAt: new Date().toISOString(),
      numero: `ENC-${Date.now()}`,
    };

    try {
      const docRef = await addDoc(collection(db, "encomendas"), encomendaData);
      setEncomendas([...encomendas, { id: docRef.id, ...encomendaData }]);
      closeModal();
    } catch (error) {
      console.error("[v0] Erro ao criar encomenda:", error);
    }
  };

  const updateStatus = async (encomenda, newStatus) => {
    try {
      await updateDoc(doc(db, "encomendas", encomenda.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      setEncomendas(
        encomendas.map((e) =>
          e.id === encomenda.id ? { ...e, status: newStatus } : e
        )
      );
    } catch (error) {
      console.error("[v0] Erro ao atualizar status:", error);
    }
  };

  const openPrintModal = (encomenda) => {
    setSelectedEncomenda(encomenda);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Encomenda ${selectedEncomenda?.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #1f2937; }
            .header p { color: #6b7280; margin: 5px 0; }
            .info { margin-bottom: 20px; }
            .info p { margin: 5px 0; }
            .info strong { color: #374151; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { background: #f9fafb; font-weight: 600; }
            .total { text-align: right; font-size: 1.125rem; font-weight: bold; }
            .obs { margin-top: 20px; padding: 10px; background: #f9fafb; border-radius: 5px; }
            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 0.875rem; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "enviada":
        return "Enviada";
      case "recebida":
        return "Recebida";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pendente":
        return styles.statusPendente;
      case "enviada":
        return styles.statusEnviada;
      case "recebida":
        return styles.statusRecebida;
      case "cancelada":
        return styles.statusCancelada;
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Encomendas a Fornecedores</h1>
        <button onClick={openModal} className={styles.addButton}>
          <Plus size={20} />
          Nova Encomenda
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className={styles.alertBanner}>
          <AlertTriangle size={20} />
          <span>
            {lowStockProducts.length} produto(s) com stock baixo precisam de reposição
          </span>
        </div>
      )}

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.emptyState}>Carregando...</div>
        ) : encomendas.length === 0 ? (
          <div className={styles.emptyState}>
            <Truck size={48} />
            <p>Nenhuma encomenda registrada</p>
          </div>
        ) : (
          encomendas
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((encomenda) => (
              <div key={encomenda.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cardNumero}>{encomenda.numero}</span>
                    <span className={styles.cardDate}>
                      {formatDate(encomenda.createdAt)}
                    </span>
                  </div>
                  <span className={`${styles.status} ${getStatusClass(encomenda.status)}`}>
                    {getStatusLabel(encomenda.status)}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.fornecedor}>{encomenda.fornecedorNome}</p>
                  <p className={styles.itensCount}>
                    {encomenda.itens?.length || 0} itens
                  </p>
                  <p className={styles.total}>
                    {handleFormatCoin(encomenda.total || 0)}
                  </p>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => openPrintModal(encomenda)}
                    className={styles.actionButton}
                  >
                    <Printer size={14} />
                    Imprimir
                  </button>
                  {encomenda.status === "pendente" && (
                    <button
                      onClick={() => updateStatus(encomenda, "enviada")}
                      className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                    >
                      Marcar Enviada
                    </button>
                  )}
                  {encomenda.status === "enviada" && (
                    <button
                      onClick={() => updateStatus(encomenda, "recebida")}
                      className={`${styles.actionButton} ${styles.actionButtonSuccess}`}
                    >
                      Marcar Recebida
                    </button>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {showModal && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>Nova Encomenda</h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={modalStyles.content}>
                <div className={modalStyles.form}>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Fornecedor</label>
                    <select
                      value={formData.fornecedorId}
                      onChange={(e) =>
                        setFormData({ ...formData, fornecedorId: e.target.value })
                      }
                      className={modalStyles.select}
                      required
                    >
                      <option value="">Selecione o fornecedor...</option>
                      {fornecedores.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.itensSection}>
                    <h3 className={styles.itensTitulo}>Itens da Encomenda</h3>
                    {formData.itens.length === 0 ? (
                      <p className={styles.itensEmpty}>Nenhum item adicionado</p>
                    ) : (
                      <div className={styles.itensList}>
                        {formData.itens.map((item, index) => (
                          <div key={item.produtoId} className={styles.itemRow}>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemNome}>{item.nome}</span>
                              <span className={styles.itemMeta}>
                                Atual: {item.quantidadeAtual} | Min: {item.minStock}
                              </span>
                            </div>
                            <div className={styles.itemQuantidade}>
                              <input
                                type="number"
                                min="0"
                                value={item.quantidadeEncomendar}
                                onChange={(e) =>
                                  handleItemQuantityChange(index, e.target.value)
                                }
                                className={styles.itemInput}
                              />
                            </div>
                            <div className={styles.itemPreco}>
                              {handleFormatCoin(
                                item.quantidadeEncomendar * item.precoCusto
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className={styles.itemRemove}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.addItemSection}>
                      <label className={modalStyles.label}>Adicionar Produto</label>
                      <select
                        onChange={(e) => {
                          const produto = produtos.find(
                            (p) => p.id.toString() === e.target.value
                          );
                          if (produto) addItem(produto);
                          e.target.value = "";
                        }}
                        className={modalStyles.select}
                      >
                        <option value="">Selecione um produto...</option>
                        {produtos
                          .filter(
                            (p) => !formData.itens.find((i) => i.produtoId === p.id)
                          )
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.quantidade || 0})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className={styles.totalSection}>
                      <span>Total Estimado:</span>
                      <strong>{handleFormatCoin(calcularTotal())}</strong>
                    </div>
                  </div>

                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Observações</label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                      className={modalStyles.textarea}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className={modalStyles.footer}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={modalStyles.cancelButton}
                >
                  Cancelar
                </button>
                <button type="submit" className={modalStyles.submitButton}>
                  Criar Encomenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrintModal && selectedEncomenda && (
        <div
          className={modalStyles.overlay}
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                Documento de Encomenda
              </h2>
              <button
                onClick={() => setShowPrintModal(false)}
                className={modalStyles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={modalStyles.content}>
              <div ref={printRef} className={styles.printDocument}>
                <div className={styles.printHeader}>
                  <h1>Mamev Cosméticos</h1>
                  <p>Documento de Encomenda</p>
                </div>

                <div className={styles.printInfo}>
                  <p>
                    <strong>Número:</strong> {selectedEncomenda.numero}
                  </p>
                  <p>
                    <strong>Data:</strong> {formatDate(selectedEncomenda.createdAt)}
                  </p>
                  <p>
                    <strong>Fornecedor:</strong> {selectedEncomenda.fornecedorNome}
                  </p>
                </div>

                <table className={styles.printTable}>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Preço Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEncomenda.itens?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nome}</td>
                        <td>{item.quantidadeEncomendar}</td>
                        <td>{handleFormatCoin(item.precoCusto)}</td>
                        <td>
                          {handleFormatCoin(
                            item.quantidadeEncomendar * item.precoCusto
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.printTotal}>
                  <strong>Total:</strong> {handleFormatCoin(selectedEncomenda.total)}
                </div>

                {selectedEncomenda.observacoes && (
                  <div className={styles.printObs}>
                    <strong>Observações:</strong>
                    <p>{selectedEncomenda.observacoes}</p>
                  </div>
                )}

                <div className={styles.printFooter}>
                  <p>Documento gerado em {new Date().toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </div>
            <div className={modalStyles.footer}>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className={modalStyles.cancelButton}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className={modalStyles.submitButton}
              >
                <Printer size={18} />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Encomendas;
