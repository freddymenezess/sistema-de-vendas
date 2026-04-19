import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@services/firebase";
import {
  getVendas,
  updateProducts,
  getProducts,
} from "@services/firebaseData.service.js";
import {
  Plus,
  X,
  Search,
  FileText,
  Printer,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { showWarning, showError, showSuccess } from "@utils/sweetAlert";
import styles from "./Devolucoes.module.css";
import modalStyles from "./Modal.module.css";

const DEVOLUCOES_COLLECTION = "devolucoes";

const MOTIVOS_DEVOLUCAO = [
  "Produto danificado",
  "Defeito de fabrico",
  "Produto errado",
  "Produto vencido",
  "Embalagem violada",
  "Outro",
];

function Devolucoes() {
  const [devolucoes, setDevolucoes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [selectedDevolucao, setSelectedDevolucao] = useState(null);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const notaRef = useRef(null);

  const [formData, setFormData] = useState({
    vendaId: "",
    motivo: "",
    motivoDetalhado: "",
    produtosDevolvidos: [],
    tipoReembolso: "reembolso",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devolucoesSnapshot, vendasData, produtosData] = await Promise.all([
        getDocs(collection(db, DEVOLUCOES_COLLECTION)),
        getVendas(),
        getProducts(),
      ]);

      const devolucoesData = devolucoesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDevolucoes(devolucoesData);
      setVendas(vendasData);
      setProdutos(produtosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevolucoes = devolucoes.filter(
    (d) =>
      d.numero?.toLowerCase().includes(search.toLowerCase()) ||
      d.clienteNome?.toLowerCase().includes(search.toLowerCase()) ||
      d.vendaNumero?.toString().includes(search),
  );

  const openModal = () => {
    setFormData({
      vendaId: "",
      motivo: "",
      motivoDetalhado: "",
      produtosDevolvidos: [],
      tipoReembolso: "reembolso",
    });
    setSelectedVenda(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVenda(null);
  };

  const openNotaModal = (devolucao) => {
    setSelectedDevolucao(devolucao);
    setShowNotaModal(true);
  };

  const closeNotaModal = () => {
    setShowNotaModal(false);
    setSelectedDevolucao(null);
  };

  const handleVendaSelect = (vendaId) => {
    const venda = vendas.find((v) => v.docId === vendaId);
    if (venda) {
      setSelectedVenda(venda);
      setFormData({
        ...formData,
        vendaId: vendaId,
        produtosDevolvidos: venda.produtos.map((p) => ({
          ...p,
          devolver: false,
          quantidadeDevolver: 0,
        })),
      });
    }
  };

  const handleProdutoToggle = (index, checked) => {
    const newProdutos = [...formData.produtosDevolvidos];
    newProdutos[index].devolver = checked;
    if (!checked) {
      newProdutos[index].quantidadeDevolver = 0;
    }
    setFormData({ ...formData, produtosDevolvidos: newProdutos });
  };

  const handleQuantidadeChange = (index, value) => {
    const newProdutos = [...formData.produtosDevolvidos];
    const max = newProdutos[index].quantidade;
    newProdutos[index].quantidadeDevolver = Math.min(
      Math.max(0, parseInt(value) || 0),
      max,
    );
    setFormData({ ...formData, produtosDevolvidos: newProdutos });
  };

  const calcularTotalDevolucao = () => {
    return formData.produtosDevolvidos
      .filter((p) => p.devolver && p.quantidadeDevolver > 0)
      .reduce((acc, p) => acc + p.preco * p.quantidadeDevolver, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const produtosADevolver = formData.produtosDevolvidos.filter(
      (p) => p.devolver && p.quantidadeDevolver > 0,
    );

    if (produtosADevolver.length === 0) {
      showWarning("Atenção!", "Selecione pelo menos um produto para devolver.");
      return;
    }

    if (!formData.motivo) {
      showWarning("Atenção!", "Selecione um motivo para a devolução.");
      return;
    }

    setSubmitting(true);

    try {
      const devolucaoData = {
        numero: `DEV-${Date.now()}`,
        vendaId: formData.vendaId,
        vendaNumero: selectedVenda?.idCompra,
        clienteNome: selectedVenda?.cliente?.nome || "Cliente não identificado",
        clienteNif: selectedVenda?.cliente?.nif || "",
        motivo: formData.motivo,
        motivoDetalhado: formData.motivoDetalhado,
        tipoReembolso: formData.tipoReembolso,
        produtos: produtosADevolver.map((p) => ({
          id: p.id,
          nome: p.name || p.nome,
          quantidade: p.quantidadeDevolver,
          preco: p.preco,
          subtotal: p.preco * p.quantidadeDevolver,
        })),
        total: calcularTotalDevolucao(),
        status: "pendente",
        dataVenda: selectedVenda?.data,
        dataDevolucao: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, DEVOLUCOES_COLLECTION), devolucaoData);

      // Atualizar estoque se for reembolso ou troca
      if (formData.tipoReembolso !== "recusada") {
        const produtosAtualizados = [...produtos];
        produtosADevolver.forEach((prodDev) => {
          const idx = produtosAtualizados.findIndex((p) => p.id === prodDev.id);
          if (idx !== -1) {
            produtosAtualizados[idx] = {
              ...produtosAtualizados[idx],
              quantidade:
                (produtosAtualizados[idx].quantidade || 0) +
                prodDev.quantidadeDevolver,
            };
          }
        });
        await updateProducts(produtosAtualizados);
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error("Erro ao criar devolução:", error);
      showError(
        "Erro ao criar devolução",
        "Erro ao criar devolução: " + error.message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (devolucao, newStatus) => {
    try {
      await updateDoc(doc(db, DEVOLUCOES_COLLECTION, devolucao.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "aprovada":
        return {
          class: styles.badgeAprovada,
          icon: CheckCircle,
          label: "Aprovada",
        };
      case "recusada":
        return {
          class: styles.badgeRecusada,
          icon: XCircle,
          label: "Recusada",
        };
      default:
        return { class: styles.badgePendente, icon: Clock, label: "Pendente" };
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  const handlePrintNota = () => {
    const printContent = notaRef.current;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota de Devolução - ${selectedDevolucao?.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            .nota { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
            .empresa h1 { margin: 0 0 5px; font-size: 20px; }
            .empresa p { margin: 2px 0; color: #666; font-size: 12px; }
            .notaInfo { text-align: right; }
            .notaInfo h2 { margin: 0 0 5px; font-size: 16px; color: #dc2626; }
            .notaInfo p { margin: 2px 0; font-size: 12px; }
            .section { margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
            .section h3 { margin: 0 0 10px; font-size: 14px; color: #374151; }
            .section p { margin: 5px 0; font-size: 12px; }
            .motivo { padding: 15px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; margin-bottom: 20px; }
            .motivo h3 { margin: 0 0 10px; font-size: 14px; color: #92400e; }
            .motivo p { margin: 0; font-size: 12px; color: #78350f; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #e5e7eb; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
            .total { text-align: right; font-size: 16px; font-weight: bold; margin-bottom: 30px; }
            .decisao { padding: 15px; border: 2px solid #374151; border-radius: 8px; margin-bottom: 20px; }
            .decisao h3 { margin: 0 0 10px; font-size: 14px; }
            .decisao p { margin: 5px 0; font-size: 12px; }
            .assinaturas { display: flex; justify-content: space-between; margin-top: 50px; }
            .assinatura { text-align: center; width: 45%; }
            .assinatura-linha { border-top: 1px solid #374151; padding-top: 10px; font-size: 12px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #e5e7eb; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Verificar se venda está dentro do prazo de 7 dias
  const vendaDentroDoPrazo = (dataVenda) => {
    if (!dataVenda) return false;
    const venda = new Date(dataVenda);
    const hoje = new Date();
    const diffTime = Math.abs(hoje - venda);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Devoluções</h1>
          <p className={styles.subtitle}>
            Gerencie devoluções de produtos e notas de reembolso
          </p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar devolução..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={openModal} className={styles.addButton}>
            <Plus size={20} />
            Nova Devolução
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <RotateCcw size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Devoluções</span>
            <strong className={styles.statValue}>{devolucoes.length}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPending}`}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pendentes</span>
            <strong className={styles.statValue}>
              {devolucoes.filter((d) => d.status === "pendente").length}
            </strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Aprovadas</span>
            <strong className={styles.statValue}>
              {devolucoes.filter((d) => d.status === "aprovada").length}
            </strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconDanger}`}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Reembolsado</span>
            <strong className={styles.statValue}>
              {handleFormatCoin(
                devolucoes
                  .filter((d) => d.status === "aprovada")
                  .reduce((acc, d) => acc + (d.total || 0), 0),
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Devoluções Grid */}
      <div className={styles.grid}>
        {loading ? (
          <div className={styles.emptyState}>Carregando devoluções...</div>
        ) : filteredDevolucoes.length === 0 ? (
          <div className={styles.emptyState}>
            <RotateCcw size={48} className={styles.emptyIcon} />
            <p>Nenhuma devolução encontrada</p>
          </div>
        ) : (
          filteredDevolucoes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((devolucao) => {
              const statusInfo = getStatusBadge(devolucao.status);
              return (
                <div key={devolucao.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <span className={styles.cardNumero}>
                        {devolucao.numero}
                      </span>
                      <span className={styles.cardDate}>
                        {formatDate(devolucao.dataDevolucao)}
                      </span>
                    </div>
                    <span className={`${styles.badge} ${statusInfo.class}`}>
                      <statusInfo.icon size={14} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <p className={styles.cardCliente}>
                      {devolucao.clienteNome}
                    </p>
                    <p className={styles.cardMotivo}>
                      <strong>Motivo:</strong> {devolucao.motivo}
                    </p>
                    <p className={styles.cardItens}>
                      {devolucao.produtos?.length || 0} itens
                    </p>
                    <p className={styles.cardTotal}>
                      {handleFormatCoin(devolucao.total || 0)}
                    </p>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      onClick={() => openNotaModal(devolucao)}
                      className={styles.actionButton}
                    >
                      <FileText size={14} />
                      Ver Nota
                    </button>
                    {devolucao.status === "pendente" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(devolucao, "aprovada")
                          }
                          className={`${styles.actionButton} ${styles.actionButtonSuccess}`}
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(devolucao, "recusada")
                          }
                          className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                        >
                          Recusar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Modal Nova Devolução */}
      {showModal && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>Nova Devolução</h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={modalStyles.content}>
                <div className={modalStyles.form}>
                  {/* Selecionar Fatura */}
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>
                      Selecionar Fatura Original
                    </label>
                    <select
                      value={formData.vendaId}
                      onChange={(e) => handleVendaSelect(e.target.value)}
                      className={modalStyles.select}
                      required
                    >
                      <option value="">Selecione uma fatura...</option>
                      {vendas
                        .filter((v) => vendaDentroDoPrazo(v.data))
                        .map((v) => (
                          <option key={v.docId} value={v.docId}>
                            Fatura #{v.idCompra} - {formatDate(v.data)} -{" "}
                            {handleFormatCoin(v.total || 0)}
                          </option>
                        ))}
                    </select>
                    <small className={styles.hint}>
                      Apenas faturas dos últimos 7 dias são elegíveis
                    </small>
                  </div>

                  {selectedVenda && (
                    <>
                      {/* Produtos para Devolver */}
                      <div className={styles.produtosSection}>
                        <h3 className={styles.produtosTitulo}>
                          Produtos para Devolução
                        </h3>
                        <div className={styles.produtosList}>
                          {formData.produtosDevolvidos.map((prod, index) => (
                            <div key={index} className={styles.produtoItem}>
                              <label className={styles.produtoCheck}>
                                <input
                                  type="checkbox"
                                  checked={prod.devolver}
                                  onChange={(e) =>
                                    handleProdutoToggle(index, e.target.checked)
                                  }
                                />
                                <span className={styles.produtoNome}>
                                  {prod.name || prod.nome}
                                </span>
                              </label>
                              <div className={styles.produtoInfo}>
                                <span>Qtd. comprada: {prod.quantidade}</span>
                                <span>{handleFormatCoin(prod.preco)}</span>
                              </div>
                              {prod.devolver && (
                                <div className={styles.produtoQtd}>
                                  <label>Qtd. a devolver:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={prod.quantidade}
                                    value={prod.quantidadeDevolver}
                                    onChange={(e) =>
                                      handleQuantidadeChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    className={styles.produtoInput}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className={styles.totalDevolucao}>
                          <span>Total a Reembolsar:</span>
                          <strong>
                            {handleFormatCoin(calcularTotalDevolucao())}
                          </strong>
                        </div>
                      </div>

                      {/* Motivo */}
                      <div className={modalStyles.field}>
                        <label className={modalStyles.label}>
                          Motivo da Devolução
                        </label>
                        <select
                          value={formData.motivo}
                          onChange={(e) =>
                            setFormData({ ...formData, motivo: e.target.value })
                          }
                          className={modalStyles.select}
                          required
                        >
                          <option value="">Selecione o motivo...</option>
                          {MOTIVOS_DEVOLUCAO.map((motivo) => (
                            <option key={motivo} value={motivo}>
                              {motivo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={modalStyles.field}>
                        <label className={modalStyles.label}>
                          Descrição Detalhada
                        </label>
                        <textarea
                          value={formData.motivoDetalhado}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              motivoDetalhado: e.target.value,
                            })
                          }
                          className={modalStyles.textarea}
                          placeholder="Descreva o problema em detalhes..."
                          rows={3}
                        />
                      </div>

                      {/* Tipo de Reembolso */}
                      <div className={modalStyles.field}>
                        <label className={modalStyles.label}>
                          Tipo de Resolução
                        </label>
                        <select
                          value={formData.tipoReembolso}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tipoReembolso: e.target.value,
                            })
                          }
                          className={modalStyles.select}
                        >
                          <option value="reembolso">
                            Reembolso em Dinheiro
                          </option>
                          <option value="troca">Troca de Produto</option>
                          <option value="credito">Crédito na Loja</option>
                        </select>
                      </div>
                    </>
                  )}
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
                <button
                  type="submit"
                  className={modalStyles.submitButton}
                  disabled={submitting || !selectedVenda}
                >
                  {submitting ? "Criando..." : "Criar Devolução"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nota de Devolução */}
      {showNotaModal && selectedDevolucao && (
        <div className={modalStyles.overlay} onClick={closeNotaModal}>
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                Nota de Devolução - {selectedDevolucao.numero}
              </h2>
              <button
                onClick={closeNotaModal}
                className={modalStyles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={modalStyles.content}>
              <div ref={notaRef} className={styles.notaDevolucao}>
                {/* Header */}
                <div className={styles.notaHeader}>
                  <div className={styles.notaEmpresa}>
                    <h1>Mamev Cosméticos</h1>
                    <p>NIF: 5417289401</p>
                    <p>Luanda, Angola</p>
                    <p>Tel: +244 923 456 789</p>
                  </div>
                  <div className={styles.notaInfo}>
                    <h2>NOTA DE DEVOLUÇÃO</h2>
                    <p>Nº: {selectedDevolucao.numero}</p>
                    <p>Data: {formatDate(selectedDevolucao.dataDevolucao)}</p>
                    <p>Fatura Ref: #{selectedDevolucao.vendaNumero}</p>
                  </div>
                </div>

                {/* Cliente Info */}
                <div className={styles.notaSection}>
                  <h3>Informações do Cliente</h3>
                  <p>
                    <strong>Nome:</strong> {selectedDevolucao.clienteNome}
                  </p>
                  {selectedDevolucao.clienteNif && (
                    <p>
                      <strong>NIF:</strong> {selectedDevolucao.clienteNif}
                    </p>
                  )}
                  <p>
                    <strong>Data da Compra:</strong>{" "}
                    {formatDate(selectedDevolucao.dataVenda)}
                  </p>
                </div>

                {/* Motivo */}
                <div className={styles.notaMotivo}>
                  <h3>Motivo da Devolução</h3>
                  <p>
                    <strong>{selectedDevolucao.motivo}</strong>
                  </p>
                  {selectedDevolucao.motivoDetalhado && (
                    <p>{selectedDevolucao.motivoDetalhado}</p>
                  )}
                </div>

                {/* Produtos */}
                <table className={styles.notaTabela}>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd</th>
                      <th>Preço Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDevolucao.produtos?.map((prod, idx) => (
                      <tr key={idx}>
                        <td>{prod.nome}</td>
                        <td>{prod.quantidade}</td>
                        <td>{handleFormatCoin(prod.preco)}</td>
                        <td>{handleFormatCoin(prod.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.notaTotal}>
                  <span>Total a Reembolsar:</span>
                  <strong>{handleFormatCoin(selectedDevolucao.total)}</strong>
                </div>

                {/* Decisão */}
                <div className={styles.notaDecisao}>
                  <h3>Decisão</h3>
                  <p>
                    <strong>Tipo de Resolução:</strong>{" "}
                    {selectedDevolucao.tipoReembolso === "reembolso"
                      ? "Reembolso em Dinheiro"
                      : selectedDevolucao.tipoReembolso === "troca"
                        ? "Troca de Produto"
                        : "Crédito na Loja"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedDevolucao.status === "aprovada"
                      ? "APROVADA"
                      : selectedDevolucao.status === "recusada"
                        ? "RECUSADA"
                        : "PENDENTE"}
                  </p>
                </div>

                {/* Assinaturas */}
                <div className={styles.notaAssinaturas}>
                  <div className={styles.assinatura}>
                    <div className={styles.assinaturaLinha}>Cliente</div>
                  </div>
                  <div className={styles.assinatura}>
                    <div className={styles.assinaturaLinha}>Responsável</div>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.notaFooter}>
                  <p>
                    Documento gerado em {new Date().toLocaleString("pt-BR")}
                  </p>
                  <p>Mamev Cosméticos - Sua beleza, nossa missão</p>
                </div>
              </div>
            </div>
            <div className={modalStyles.footer}>
              <button
                type="button"
                onClick={closeNotaModal}
                className={modalStyles.cancelButton}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handlePrintNota}
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

export default Devolucoes;
