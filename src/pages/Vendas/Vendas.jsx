import { useState, useEffect, useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { getItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Vendas.module.css";

function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = () => {
    const compras = getItem("compras") || [];
    const vendasOrdenadas = [...compras].sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      return dateB - dateA;
    });
    setVendas(vendasOrdenadas);
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

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Historico de Vendas</h1>
        <p className={styles.welcomeSubtitle}>
          Visualize todas as vendas realizadas
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Todas as Vendas</h2>
          <input
            type="text"
            placeholder="Buscar por vendedor ou ID..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.sectionContent}>
          {filteredVendas.length === 0 ? (
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
                  </tr>
                </thead>
                <tbody>
                  {filteredVendas.map((venda) => (
                    <tr key={venda.idCompra}>
                      <td>{formatDate(venda.data)}</td>
                      <td>{venda.vendedorNome || "-"}</td>
                      <td>{venda.produtos?.length || 0} itens</td>
                      <td>{formatPayment(venda.formaPagamento)}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vendas;
