import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { getItem, setItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Caixas.module.css";

function Caixas({ isVendedorView = false }) {
  const [caixas, setCaixas] = useState([]);
  const [meuCaixa, setMeuCaixa] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("abrir");
  const [selectedVendedor, setSelectedVendedor] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [selectedCaixa, setSelectedCaixa] = useState(null);

  const currentUser = getItem("currentUser");

  useEffect(() => {
    if (isVendedorView) {
      loadMeuCaixa();
    } else {
      loadCaixas();
      loadVendedores();
    }
  }, [isVendedorView]);

  const loadMeuCaixa = () => {
    const allCaixas = getItem("caixas") || [];
    const caixaAtivo = allCaixas.find(
      (c) => c.vendedorId === currentUser?.id && c.status === "aberto"
    );
    setMeuCaixa(caixaAtivo || null);
  };

  const loadCaixas = () => {
    const allCaixas = getItem("caixas") || [];
    const sorted = [...allCaixas].sort((a, b) => {
      return new Date(b.dataAbertura) - new Date(a.dataAbertura);
    });
    setCaixas(sorted);
  };

  const loadVendedores = () => {
    const users = getItem("users") || [];
    const sellers = users.filter((u) => u.role === "seller");
    setVendedores(sellers);
  };

  const openModal = (type, caixa = null) => {
    setModalType(type);
    setSelectedCaixa(caixa);
    setShowModal(true);
    setValorInicial("");
    setSelectedVendedor("");
  };

  const abrirCaixa = () => {
    if (!selectedVendedor || !valorInicial) {
      alert("Preencha todos os campos");
      return;
    }

    const vendedor = vendedores.find((v) => v.id === selectedVendedor);
    const allCaixas = getItem("caixas") || [];

    // Verificar se vendedor ja tem caixa aberto
    const caixaExistente = allCaixas.find(
      (c) => c.vendedorId === selectedVendedor && c.status === "aberto"
    );
    if (caixaExistente) {
      alert("Este vendedor ja possui um caixa aberto!");
      return;
    }

    const novoCaixa = {
      id: Date.now().toString(),
      vendedorId: selectedVendedor,
      vendedorNome: vendedor?.nome || "Vendedor",
      valorInicial: parseFloat(valorInicial),
      totalVendas: 0,
      quantidadeVendas: 0,
      dataAbertura: new Date().toISOString(),
      status: "aberto",
      abertoPor: currentUser?.nome || "Gerente",
    };

    setItem("caixas", [...allCaixas, novoCaixa]);
    setShowModal(false);
    loadCaixas();
  };

  const fecharCaixa = () => {
    if (!selectedCaixa) return;

    const allCaixas = getItem("caixas") || [];
    const updatedCaixas = allCaixas.map((c) =>
      c.id === selectedCaixa.id
        ? {
            ...c,
            status: "fechado",
            dataFechamento: new Date().toISOString(),
            fechadoPor: currentUser?.nome || "Gerente",
          }
        : c
    );

    setItem("caixas", updatedCaixas);
    setShowModal(false);
    loadCaixas();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  // View do vendedor
  if (isVendedorView) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Meu Caixa</h1>
          <p className={styles.subtitle}>Acompanhe o status do seu caixa</p>
        </div>

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
                  <div className={styles.infoLabel}>Valor Inicial</div>
                  <div className={styles.infoValue}>
                    {handleFormatCoin(meuCaixa.valorInicial)}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Total Vendas</div>
                  <div className={styles.infoValue}>
                    {handleFormatCoin(meuCaixa.totalVendas)}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Qtd. Vendas</div>
                  <div className={styles.infoValue}>
                    {meuCaixa.quantidadeVendas || 0}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Total em Caixa</div>
                  <div className={styles.infoValue}>
                    {handleFormatCoin(
                      (meuCaixa.valorInicial || 0) + (meuCaixa.totalVendas || 0)
                    )}
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
              Seu caixa ainda nao foi aberto hoje.
              <br />
              Solicite a abertura ao gerente.
            </p>
          )}
        </div>
      </div>
    );
  }

  // View do gerente/admin
  const caixasAbertos = caixas.filter((c) => c.status === "aberto");
  const caixasFechados = caixas
    .filter((c) => c.status === "fechado")
    .slice(0, 10);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestao de Caixas</h1>
        <p className={styles.subtitle}>Gerencie os caixas dos vendedores</p>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <h2 className={styles.statusTitle}>Abrir Novo Caixa</h2>
        </div>
        <button onClick={() => openModal("abrir")} className={styles.openButton}>
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
                      (caixa.valorInicial || 0) + (caixa.totalVendas || 0)
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
                      (caixa.valorInicial || 0) + (caixa.totalVendas || 0)
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
                    onChange={(e) => setSelectedVendedor(e.target.value)}
                    className={styles.modalInput}
                  >
                    <option value="">Selecione...</option>
                    {vendedores.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nome}
                      </option>
                    ))}
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
                      (selectedCaixa?.totalVendas || 0)
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
              >
                {modalType === "abrir" ? "Abrir Caixa" : "Confirmar Fechamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Caixas;
