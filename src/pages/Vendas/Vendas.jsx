import { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingCart, Eye, Printer, X } from "lucide-react";
import { getVendas } from "@services/firebaseData.service.js";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import useAuth from "@hooks/useAuth";
import Fatura from "@components/Fatura/Fatura";
import styles from "./Vendas.module.css";
import modalStyles from "./Modal.module.css";

function Vendas({ isVendedorView = false }) {
  const { user } = useAuth();
  const [vendas, setVendas] = useState([]);
  const [filtro, setFiltro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const faturaRef = useRef(null);

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      const compras = await getVendas();
      let vendasFiltradas = compras;
      
      // Se for visao do vendedor, filtrar apenas as vendas dele
      if (isVendedorView && user?.uid) {
        vendasFiltradas = compras.filter(v => v.vendedorId === user.uid);
      }
      
      const vendasOrdenadas = [...vendasFiltradas].sort((a, b) => {
        const dateA = new Date(a.data);
        const dateB = new Date(b.data);
        return dateB - dateA;
      });
      setVendas(vendasOrdenadas);
    } catch (error) {
      console.error("[v0] Erro ao carregar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendas = useMemo(() => {
    if (!filtro) return vendas;
    return vendas.filter(
      (v) =>
        v.idCompra?.toString().includes(filtro) ||
        v.vendedorNome?.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [vendas, filtro]);

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

  const formatPayment = (payment) => {
    const labels = {
      dinheiro: "Dinheiro",
      cartao_credito: "Credito",
      cartao_debito: "Debito",
      pix: "PIX",
    };
    return labels[payment] || payment || "-";
  };

  const openFaturaModal = (venda) => {
    setSelectedVenda(venda);
    setShowFaturaModal(true);
  };

  const closeFaturaModal = () => {
    setShowFaturaModal(false);
    setSelectedVenda(null);
  };

  const handlePrintFatura = () => {
    const printContent = faturaRef.current;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Fatura ${selectedVenda?.idCompra}</title>
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
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          {isVendedorView ? "Minhas Vendas" : "Historico de Vendas"}
        </h1>
        <p className={styles.welcomeSubtitle}>
          {isVendedorView 
            ? "Visualize todas as suas vendas realizadas" 
            : "Visualize todas as vendas realizadas"}
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {isVendedorView ? "As Minhas Vendas" : "Todas as Vendas"}
          </h2>
          <input
            type="text"
            placeholder="Buscar por vendedor ou ID..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.sectionContent}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Carregando vendas...</p>
            </div>
          ) : filteredVendas.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingCart size={48} className={styles.emptyStateIcon} />
              <p>Nenhuma venda encontrada</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Vendedor</th>
                    <th>Itens</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendas.map((venda) => (
                    <tr key={venda.idCompra}>
                      <td>{formatDate(venda.data)}</td>
                      <td>{venda.vendedor || "-"}</td>
                      <td>{venda.produtos?.length || 0} itens</td>
                      <td>{formatPayment(venda.pagamento)}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            venda.status === "concluida"
                              ? styles.badgeGreen
                              : venda.status === "cancelada"
                                ? styles.badgeRed
                                : styles.badgeYellow
                          }`}
                        >
                          {venda.status || "concluida"}
                        </span>
                      </td>
                      <td>
                        <strong>{handleFormatCoin(venda.total || 0)}</strong>
                      </td>
                      <td>
                        <button
                          onClick={() => openFaturaModal(venda)}
                          className={styles.faturaButton}
                          title="Ver Fatura"
                        >
                          <Eye size={16} />
                          Fatura
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal da Fatura */}
      {showFaturaModal && selectedVenda && (
        <div className={modalStyles.overlay} onClick={closeFaturaModal}>
          <div
            className={`${modalStyles.modal} ${modalStyles.modalLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.header}>
              <h2 className={modalStyles.title}>
                Fatura #{selectedVenda.idCompra}
              </h2>
              <button onClick={closeFaturaModal} className={modalStyles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={modalStyles.content}>
              <Fatura ref={faturaRef} venda={selectedVenda} />
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
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vendas;
