import { useMemo } from "react";
import { ShoppingCart, Receipt, TrendingUp } from "lucide-react";
import { getItem } from "../../../services/storage";
import { handleFormatCoin } from "../../../utils/handleFormatCoin";
import styles from "./SalesStatistics.module.css";

function SalesStatistics({ className }) {
  const compras = getItem("compras") || [];
  const { totalVendido, totalVendas, ticketMedio } = useMemo(() => {
    const total = compras.reduce((acc, compra) => acc + compra.total, 0);
    const quantidade = compras.length;
    const media = quantidade > 0 ? total / quantidade : 0;

    return {
      totalVendido: total,
      totalVendas: quantidade,
      ticketMedio: media,
    };
  }, [compras]);

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <ShoppingCart size={24} />
        </div>
        <div>
          <span className={styles.subtitle}>Resumo</span>
          <h3 className={styles.title}>Estatisticas de Vendas</h3>
        </div>
      </div>

      <div className={styles.mainValue}>
        <span className={styles.label}>Total Faturado</span>
        <h2 className={styles.value}>{handleFormatCoin(totalVendido)}</h2>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <div className={styles.metricIcon} data-color="primary">
            <Receipt size={18} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Vendas</span>
            <strong>{totalVendas}</strong>
          </div>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricIcon} data-color="success">
            <TrendingUp size={18} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Ticket Medio</span>
            <strong>{handleFormatCoin(ticketMedio)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesStatistics;
