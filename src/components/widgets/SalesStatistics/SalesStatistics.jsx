import { useMemo } from "react";
import Card from "@components/Card/Card";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
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
    <Card className={`${styles.card} ${className}`}>
      <div className={styles.main}>
        <div className={styles.iconBox}>
          <ShoppingCartIcon />
        </div>

        <div>
          <p className={styles.label}>Total faturado</p>
          <h2 className={styles.value}>{handleFormatCoin(totalVendido)}</h2>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <ReceiptLongIcon className={styles.smallIcon} />
          <span>{totalVendas} vendas</span>
        </div>

        <div className={styles.metric}>
          <TrendingUpIcon className={styles.smallIcon} />
          <span>Ticket médio: {handleFormatCoin(ticketMedio)}</span>
        </div>
      </div>
    </Card>
  );
}

export default SalesStatistics;
