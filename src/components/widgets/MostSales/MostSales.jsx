import { getItem } from "@services/storage.js";
import styles from "./MostSales.module.css";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SellIcon from "@mui/icons-material/Sell";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Tooltip from "@mui/material/Tooltip";

function MostSales({ className }) {
  const compras = getItem("compras") || [];

  // Calcula total de vendas por produto
  const salesMap = {};
  compras.forEach((compra) => {
    compra.produtos.forEach((item) => {
      if (!salesMap[item.id]) {
        salesMap[item.id] = { ...item };
      } else {
        salesMap[item.id].quantidade += item.quantidade;
        salesMap[item.id].preco_pagar += item.preco_pagar;
      }
    });
  });

  const sorted = Object.values(salesMap)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 6);

  if (sorted.length === 0) return null;

  const topProduct = sorted[0];
  const otherProducts = sorted.slice(1);

  return (
    <div className={`${styles.card} ${className}`}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.icon}>
          <TrendingUpIcon />
        </div>
        <div>
          <p className={styles.subtitle}>Performance</p>
          <h2 className={styles.title}>Produtos Mais Vendidos</h2>
        </div>
      </header>

      {/* Produto Destaque */}
      <div className={styles.featured}>
        <div className={styles.rankBadge}>TOP 1</div>
        <h3 className={styles.productName}>{topProduct.name}</h3>
        <div className={styles.featuredStats}>
          <Tooltip title="Quantidade vendida">
            <div className={styles.stat}>
              <SellIcon fontSize="small" className={styles.statIcon} />
              <span>{topProduct.quantidade}</span>
            </div>
          </Tooltip>
          <Tooltip title="Faturamento">
            <div className={styles.stat}>
              <AttachMoneyIcon fontSize="small" className={styles.statIcon} />
              <span>
                {topProduct.preco_pagar.toLocaleString("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                })}
              </span>
            </div>
          </Tooltip>
          <Tooltip title="Estoque vendido">
            <div className={styles.stat}>
              <InventoryIcon fontSize="small" className={styles.statIcon} />
              <span>{topProduct.quantidade}</span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className={styles.list}>
        {otherProducts.map((item, index) => (
          <div key={item.id} className={styles.listItem}>
            <div className={styles.left}>
              <div className={styles.rank}>
                {index + 2}
                {index + 2 === 2 ? (
                  <ArrowUpwardIcon className={styles.arrow} />
                ) : (
                  <ArrowDownwardIcon className={styles.arrow} />
                )}
              </div>
              <h4 className={styles.productName}>{item.name}</h4>
            </div>

            <div className={styles.right}>
              <Tooltip title="Quantidade vendida">
                <div className={styles.stat}>
                  <SellIcon fontSize="small" className={styles.statIcon} />
                  <span>{item.quantidade}</span>
                </div>
              </Tooltip>
              <Tooltip title="Faturamento">
                <div className={styles.stat}>
                  <AttachMoneyIcon
                    fontSize="small"
                    className={styles.statIcon}
                  />
                  <span>
                    {item.preco_pagar.toLocaleString("pt-AO", {
                      style: "currency",
                      currency: "AOA",
                    })}
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MostSales;
