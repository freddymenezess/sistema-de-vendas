import { useState, useEffect, useCallback } from "react";
import { CreditCard, TrendingUp, ShoppingCart } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@services/firebase";
import useAuth from "@hooks/useAuth";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { showWarning, showError, showSuccess } from "@utils/sweetAlert";
import { getVendas } from "@services/firebaseData.service.js";
import styles from "./Caixas.module.css";

function Caixas({ isVendedorView = false }) {
  const { user } = useAuth();
  const [caixas, setCaixas] = useState([]);
  const [meuCaixa, setMeuCaixa] = useState(null);
  const [minhasVendas, setMinhasVendas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [isLoadingVendedores, setIsLoadingVendedores] = useState(false);
  const [isLoadingCaixa, setIsLoadingCaixa] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("abrir");
  const [selectedVendedor, setSelectedVendedor] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [selectedCaixa, setSelectedCaixa] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMeuCaixa = useCallback(async () => {
    setIsLoadingCaixa(true);
    try {
      const caixasRef = collection(db, "caixas");
      const snapshot = await getDocs(caixasRef);
      const caixaAtivo = snapshot.docs.find((d) => {
        const data = d.data();
        return data.vendedorId === user?.uid && data.status === "aberto";
      });

      if (!caixaAtivo) {
        setMeuCaixa(null);
        setMinhasVendas([]);
        return;
      }

      const caixaData = { id: caixaAtivo.id, ...caixaAtivo.data() };

      // 👇 Recolher todas as sessões de hoje deste vendedor (abertas e fechadas)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const todasSessoes = snapshot.docs
        .filter((d) => {
          const data = d.data();
          const abertura = data.dataAbertura?.toDate
            ? data.dataAbertura.toDate()
            : new Date(data.dataAbertura);
          return data.vendedorId === user?.uid && abertura >= hoje;
        })
        .map((d) => ({ id: d.id, ...d.data() }));

      const todasVendas = await getVendas();
      const vendasDoVendedor = todasVendas.filter(
        (v) => v.vendedorId === user?.uid,
      );

      // 👇 Incluir vendas que caiam dentro de qualquer sessão do dia
      const vendasDoCaixa = vendasDoVendedor.filter((v) => {
        const dataVenda = v.data?.toDate ? v.data.toDate() : new Date(v.data);
        return todasSessoes.some((sessao) => {
          const abertura = sessao.dataAbertura?.toDate
            ? sessao.dataAbertura.toDate()
            : new Date(sessao.dataAbertura);
          const fechamento = sessao.dataFechamento
            ? sessao.dataFechamento?.toDate
              ? sessao.dataFechamento.toDate()
              : new Date(sessao.dataFechamento)
            : new Date(); // sessão ainda aberta
          return dataVenda >= abertura && dataVenda <= fechamento;
        });
      });

      const totalVendas = vendasDoCaixa.reduce(
        (acc, v) => acc + (v.total || 0),
        0,
      );
      const totalTroco = vendasDoCaixa.reduce(
        (acc, v) => acc + (v.troco || 0),
        0,
      );
      const quantidadeVendas = vendasDoCaixa.length;

      setMeuCaixa({
        ...caixaData,
        totalVendas,
        totalTroco,
        quantidadeVendas,
        totalEmCaixa: (caixaData.valorInicial || 0) + totalVendas - totalTroco,
      });
      setMinhasVendas(vendasDoCaixa);
    } catch (error) {
      console.error("Erro ao carregar meu caixa:", error);
    } finally {
      setIsLoadingCaixa(false);
    }
  }, [user?.uid]);

  const loadCaixas = useCallback(async () => {
    try {
      const caixasRef = collection(db, "caixas");
      const snapshot = await getDocs(caixasRef);
      const caixasData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const dateA = a.dataAbertura?.toDate
            ? a.dataAbertura.toDate()
            : new Date(a.dataAbertura);
          const dateB = b.dataAbertura?.toDate
            ? b.dataAbertura.toDate()
            : new Date(b.dataAbertura);
          return dateB - dateA;
        });
      setCaixas(caixasData);
    } catch (error) {
      console.error("Erro ao carregar caixas:", error);
    }
  }, []);

  const loadVendedores = useCallback(async () => {
    setIsLoadingVendedores(true);
    try {
      const usuariosRef = collection(db, "usuarios");
      const snapshot = await getDocs(usuariosRef);
      const vendedoresData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.cargo === "seller");
      setVendedores(vendedoresData);
    } catch (error) {
      console.error("Erro ao carregar vendedores:", error);
    } finally {
      setIsLoadingVendedores(false);
    }
  }, []);

  useEffect(() => {
    if (isVendedorView) {
      loadMeuCaixa();
    } else {
      loadCaixas();
      loadVendedores();
    }
  }, [isVendedorView, loadCaixas, loadMeuCaixa, loadVendedores]);

  const openModal = (type, caixa = null) => {
    setModalType(type);
    setSelectedCaixa(caixa);
    setShowModal(true);
    setValorInicial("");
    setSelectedVendedor("");
  };

  const abrirCaixa = async () => {
    if (!selectedVendedor || !valorInicial) {
      showWarning(
        "Atenção!",
        "Por favor, preencha todos os campos obrigatórios.",
      );
      return;
    }

    const vendedor = vendedores.find((v) => v.id === selectedVendedor);
    const caixaExistente = caixas.find(
      (c) => c.vendedorId === selectedVendedor && c.status === "aberto",
    );
    if (caixaExistente) {
      showError(
        "Caixa já aberto",
        "Este vendedor já possui um caixa aberto. Feche o anterior antes de abrir um novo.",
      );
      return;
    }

    setIsSubmitting(true); // 👈 bloqueia
    try {
      await addDoc(collection(db, "caixas"), {
        vendedorId: selectedVendedor,
        vendedorNome: vendedor?.nome || "Vendedor",
        valorInicial: parseFloat(valorInicial),
        totalVendas: 0,
        quantidadeVendas: 0,
        dataAbertura: new Date(),
        status: "aberto",
        abertoPor: user?.nome || "Gerente",
      });

      setShowModal(false);
      loadCaixas();
      showSuccess(
        "Caixa Aberto!",
        `Caixa de ${vendedor?.nome} aberto com valor inicial de ${handleFormatCoin(valorInicial)}.`,
      );
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      showError("Erro", "Não foi possível abrir o caixa. Tente novamente.");
    } finally {
      setIsSubmitting(false); // 👈 liberta sempre, mesmo em erro
    }
  };

  const fecharCaixa = async () => {
    if (!selectedCaixa) return;

    try {
      await updateDoc(doc(db, "caixas", selectedCaixa.id), {
        status: "fechado",
        dataFechamento: new Date(),
        fechadoPor: user?.nome || "Gerente",
        valorFinal:
          (selectedCaixa.valorInicial || 0) +
          (selectedCaixa.totalVendas || 0) -
          (selectedCaixa.totalTroco || 0), // totalTroco pode ser 0 na vista do gerente — ver nota abaixo
      });
      setShowModal(false);
      loadCaixas();
      showSuccess(
        "Caixa Fechado!",
        `Caixa de ${selectedCaixa.vendedorNome} foi fechado com êxito.`,
      );
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      showError("Erro", "Não foi possível fechar o caixa. Tente novamente.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatPayment = (payment) => {
    const labels = {
      dinheiro: "Dinheiro",
      cartao_credito: "Cartão de Crédito",
    };
    return labels[payment] || payment || "-";
  };

  const handleVendedorChange = (e) => {
    const id = e.target.value;
    setSelectedVendedor(id);

    // Buscar o último caixa fechado deste vendedor
    const ultimoCaixa = caixas
      .filter(
        (c) =>
          c.vendedorId === id && c.status === "fechado" && c.valorFinal != null,
      )
      .sort((a, b) => {
        const dateA = a.dataFechamento?.toDate
          ? a.dataFechamento.toDate()
          : new Date(a.dataFechamento);
        const dateB = b.dataFechamento?.toDate
          ? b.dataFechamento.toDate()
          : new Date(b.dataFechamento);
        return dateB - dateA;
      })[0];

    setValorInicial(
      ultimoCaixa?.valorFinal != null ? String(ultimoCaixa.valorFinal) : "",
    );
  };

  if (isVendedorView) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Meu Caixa</h1>
          <p className={styles.subtitle}>
            Acompanhe o estado do seu caixa e as suas vendas
          </p>
        </div>

        {isLoadingCaixa ? (
          <div className={styles.loadingContainer}>
            <h2 className={styles.sectionTitle}>Estado do Caixa</h2>
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Carregando dados do caixa...</p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <div
                  className={`${styles.statusBadge} ${meuCaixa ? styles.statusOpen : styles.statusClosed}`}
                >
                  <span className={styles.statusDot} />
                  {meuCaixa ? "Caixa Aberto" : "Caixa Fechado"}
                </div>
              </div>

              {meuCaixa ? (
                <>
                  <div className={styles.caixaInfo}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Total em Vendas</div>
                      <div
                        className={`${styles.infoValue} ${styles.infoValueSuccess}`}
                      >
                        {handleFormatCoin(meuCaixa.totalVendas || 0)}
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>
                        Quantidade de Vendas
                      </div>
                      <div className={styles.infoValue}>
                        {meuCaixa.quantidadeVendas || 0}
                      </div>
                    </div>
                    <div
                      className={`${styles.infoItem} ${styles.infoItemHighlight}`}
                    >
                      <div className={styles.infoLabel}>Total em Caixa</div>
                      <div
                        className={`${styles.infoValue} ${styles.infoValuePrimary}`}
                      >
                        {handleFormatCoin(meuCaixa.totalEmCaixa || 0)}
                      </div>
                    </div>
                  </div>
                  <p className={styles.caixaMeta}>
                    Aberto em: {formatDate(meuCaixa.dataAbertura)} por{" "}
                    {meuCaixa.abertoPor}
                  </p>
                </>
              ) : (
                <p className={styles.caixaEmpty}>
                  O seu caixa ainda nao foi aberto hoje.
                  <br />
                  Solicite a abertura ao gerente.
                </p>
              )}
            </div>

            {/* Vendas do Vendedor */}
            {meuCaixa && minhasVendas.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <TrendingUp size={20} />
                    Minhas Vendas de Hoje ({minhasVendas.length})
                  </h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.movimentacaoList}>
                    {minhasVendas.map((venda) => (
                      <div
                        key={venda.idCompra || venda.docId}
                        className={styles.movimentacaoItem}
                      >
                        <div
                          className={`${styles.movimentacaoIcon} ${styles.movimentacaoIn}`}
                        >
                          <ShoppingCart size={18} />
                        </div>
                        <div className={styles.movimentacaoInfo}>
                          <div className={styles.movimentacaoDesc}>
                            {venda.produtos?.length || 0}{" "}
                            {venda.produtos?.length === 1 ? "item" : "itens"} -{" "}
                            {venda.clienteNome || "Consumidor Final"}
                          </div>
                          <div className={styles.movimentacaoTime}>
                            {formatDate(venda.data)} |{" "}
                            {formatPayment(venda.pagamento)}
                          </div>
                        </div>
                        <div
                          className={`${styles.movimentacaoValue} ${styles.valuePositive}`}
                        >
                          {handleFormatCoin(venda.total || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {meuCaixa && minhasVendas.length === 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Minhas Vendas de Hoje</h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.emptyState}>
                    <ShoppingCart size={48} className={styles.emptyStateIcon} />
                    <p>Nenhuma venda realizada ainda</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  const caixasAbertos = caixas.filter((c) => c.status === "aberto");
  const caixasFechados = caixas
    .filter((c) => c.status === "fechado")
    .slice(0, 10);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestão de Caixas</h1>
        <p className={styles.subtitle}>Gerencie os caixas dos vendedores</p>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <h2 className={styles.statusTitle}>Abrir Novo Caixa</h2>
        </div>
        <button
          onClick={() => openModal("abrir")}
          className={styles.openButton}
        >
          Abrir Caixa para Vendedor
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Caixas Abertos ({caixasAbertos.length})
          </h2>
        </div>
        <div className={styles.sectionContent}>
          {caixasAbertos.length === 0 ? (
            <p className={styles.emptyText}>Nenhum caixa aberto</p>
          ) : (
            <div className={styles.movimentacaoList}>
              {caixasAbertos.map((caixa) => (
                <div key={caixa.id} className={styles.movimentacaoItem}>
                  <div
                    className={`${styles.movimentacaoIcon} ${styles.movimentacaoIn}`}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div className={styles.movimentacaoInfo}>
                    <div className={styles.movimentacaoDesc}>
                      {caixa.vendedorNome}
                    </div>
                    <div className={styles.movimentacaoTime}>
                      Aberto: {formatDate(caixa.dataAbertura)} | Vendas:{" "}
                      {caixa.quantidadeVendas || 0}
                    </div>
                  </div>
                  <div
                    className={`${styles.movimentacaoValue} ${styles.valuePositive}`}
                  >
                    {handleFormatCoin(
                      (caixa.valorInicial || 0) + (caixa.totalVendas || 0),
                    )}
                  </div>
                  <button
                    onClick={() => openModal("fechar", caixa)}
                    className={styles.closeButton}
                  >
                    Fechar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Caixas Fechados Recentes</h2>
        </div>
        <div className={styles.sectionContent}>
          {caixasFechados.length === 0 ? (
            <p className={styles.emptyText}>Nenhum caixa fechado</p>
          ) : (
            <div className={styles.movimentacaoList}>
              {caixasFechados.map((caixa) => (
                <div key={caixa.id} className={styles.movimentacaoItem}>
                  <div
                    className={`${styles.movimentacaoIcon} ${styles.movimentacaoOut}`}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div className={styles.movimentacaoInfo}>
                    <div className={styles.movimentacaoDesc}>
                      {caixa.vendedorNome}
                    </div>
                    <div className={styles.movimentacaoTime}>
                      Fechado: {formatDate(caixa.dataFechamento)}
                    </div>
                  </div>
                  <div className={styles.movimentacaoValue}>
                    {handleFormatCoin(
                      (caixa.valorInicial || 0) + (caixa.totalVendas || 0),
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div
            className={styles.modalOverlay}
            onClick={() => setShowModal(false)}
          />
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {modalType === "abrir" ? "Abrir Caixa" : "Fechar Caixa"}
            </h2>

            {modalType === "abrir" ? (
              <>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Vendedor</label>
                  <select
                    value={selectedVendedor}
                    onChange={handleVendedorChange}
                    className={styles.modalInput}
                    disabled={isLoadingVendedores}
                  >
                    {isLoadingVendedores ? (
                      <option>Carregando vendedores...</option>
                    ) : (
                      <>
                        <option value="">Selecione...</option>
                        {vendedores.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.nome}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>
                    Valor Inicial (Fundo de Troco)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorInicial}
                    onChange={(e) => setValorInicial(e.target.value)}
                    className={styles.modalInput}
                    placeholder="0.00"
                  />
                </div>
              </>
            ) : (
              <div className={styles.modalDetails}>
                <p>
                  <strong>Vendedor:</strong> {selectedCaixa?.vendedorNome}
                </p>
                <p>
                  <strong>Valor Inicial:</strong>{" "}
                  {handleFormatCoin(selectedCaixa?.valorInicial)}
                </p>
                <p>
                  <strong>Total Vendas:</strong>{" "}
                  {handleFormatCoin(selectedCaixa?.totalVendas)}
                </p>
                <p>
                  <strong>Total em Caixa:</strong>{" "}
                  {handleFormatCoin(
                    (selectedCaixa?.valorInicial || 0) +
                      (selectedCaixa?.totalVendas || 0),
                  )}
                </p>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                className={styles.modalCancel}
              >
                Cancelar
              </button>
              <button
                onClick={modalType === "abrir" ? abrirCaixa : fecharCaixa}
                className={styles.modalConfirm}
                disabled={isSubmitting} // 👈
              >
                {modalType === "abrir"
                  ? isSubmitting
                    ? "A abrir..."
                    : "Abrir Caixa"
                  : "Confirmar Fechamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Caixas;
