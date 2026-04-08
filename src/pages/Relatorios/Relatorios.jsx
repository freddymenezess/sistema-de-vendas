import { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { getItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Relatorios.module.css";

function Relatorios() {
  const [periodo, setPeriodo] = useState("mes");
  const [stats, setStats] = useState({
    totalVendas: 0,
    ticketMedio: 0,
    totalProdutos: 0,
    produtosVendidos: 0,
    vendedorTop: null,
    produtoTop: null,
    comparativo: { atual: 0, anterior: 0 },
  });

  useEffect(() => {
    calcularRelatorios();
  }, [periodo]);

  const calcularRelatorios = () => {
    const vendas = getItem("vendas") || [];
    const produtos = getItem("produtos") || [];
    const users = getItem("users") || [];

    const now = new Date();
    let dataInicio, dataInicioAnterior, dataFimAnterior;

    if (periodo === "dia") {
      dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dataInicioAnterior = new Date(dataInicio);
      dataInicioAnterior.setDate(dataInicioAnterior.getDate() - 1);
      dataFimAnterior = new Date(dataInicio);
    } else if (periodo === "semana") {
      const dayOfWeek = now.getDay();
      dataInicio = new Date(now);
      dataInicio.setDate(now.getDate() - dayOfWeek);
      dataInicio.setHours(0, 0, 0, 0);
      dataInicioAnterior = new Date(dataInicio);
      dataInicioAnterior.setDate(dataInicioAnterior.getDate() - 7);
      dataFimAnterior = new Date(dataInicio);
    } else {
      dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
      dataInicioAnterior = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      dataFimAnterior = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    // Vendas do periodo atual
    const vendasPeriodo = vendas.filter((v) => {
      const dataVenda = new Date(v.data);
      return dataVenda >= dataInicio && dataVenda <= now;
    });

    // Vendas do periodo anterior
    const vendasAnterior = vendas.filter((v) => {
      const dataVenda = new Date(v.data);
      return dataVenda >= dataInicioAnterior && dataVenda < dataFimAnterior;
    });

    const totalVendas = vendasPeriodo.reduce(
      (acc, v) => acc + (v.total || 0),
      0
    );
    const totalAnterior = vendasAnterior.reduce(
      (acc, v) => acc + (v.total || 0),
      0
    );
    const ticketMedio =
      vendasPeriodo.length > 0 ? totalVendas / vendasPeriodo.length : 0;

    // Contador de produtos vendidos
    const produtosVendidos = vendasPeriodo.reduce((acc, v) => {
      return acc + (v.itens?.reduce((a, i) => a + (i.quantidade || 0), 0) || 0);
    }, 0);

    // Top vendedor
    const vendedorVendas = {};
    vendasPeriodo.forEach((v) => {
      const vendedorId = v.vendedorId;
      if (vendedorId) {
        vendedorVendas[vendedorId] =
          (vendedorVendas[vendedorId] || 0) + (v.total || 0);
      }
    });

    let vendedorTop = null;
    let maxVendas = 0;
    Object.entries(vendedorVendas).forEach(([id, total]) => {
      if (total > maxVendas) {
        maxVendas = total;
        const user = users.find((u) => u.id === id);
        vendedorTop = { nome: user?.nome || "Vendedor", total };
      }
    });

    // Top produto
    const produtoVendas = {};
    vendasPeriodo.forEach((v) => {
      v.itens?.forEach((item) => {
        const produtoId = item.produtoId || item.id;
        if (produtoId) {
          produtoVendas[produtoId] =
            (produtoVendas[produtoId] || 0) + (item.quantidade || 0);
        }
      });
    });

    let produtoTop = null;
    let maxQtd = 0;
    Object.entries(produtoVendas).forEach(([id, qtd]) => {
      if (qtd > maxQtd) {
        maxQtd = qtd;
        const produto = produtos.find((p) => p.id === id);
        produtoTop = { nome: produto?.nome || "Produto", quantidade: qtd };
      }
    });

    setStats({
      totalVendas,
      ticketMedio,
      totalProdutos: produtos.length,
      produtosVendidos,
      vendedorTop,
      produtoTop,
      comparativo: { atual: totalVendas, anterior: totalAnterior },
    });
  };

  const calcularVariacao = () => {
    const { atual, anterior } = stats.comparativo;
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const variacao = calcularVariacao();

  const handleExportarRelatorio = () => {
    const vendas = getItem("vendas") || [];
    const produtos = getItem("produtos") || [];

    const data = {
      periodo,
      dataExportacao: new Date().toISOString(),
      estatisticas: stats,
      vendas: vendas.slice(0, 100),
      produtos,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${periodo}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Relatorios</h1>
        <p className={styles.welcomeSubtitle}>Analise os dados do seu negocio</p>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.periodButtons}>
          <button
            className={`${styles.periodButton} ${periodo === "dia" ? styles.active : ""}`}
            onClick={() => setPeriodo("dia")}
          >
            Hoje
          </button>
          <button
            className={`${styles.periodButton} ${periodo === "semana" ? styles.active : ""}`}
            onClick={() => setPeriodo("semana")}
          >
            Semana
          </button>
          <button
            className={`${styles.periodButton} ${periodo === "mes" ? styles.active : ""}`}
            onClick={() => setPeriodo("mes")}
          >
            Mes
          </button>
        </div>
        <button onClick={handleExportarRelatorio} className={styles.exportButton}>
          <Download size={18} />
          Exportar
        </button>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total de Vendas</span>
            <div className={`${styles.metricIcon} ${styles.iconGreen}`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {handleFormatCoin(stats.totalVendas)}
          </div>
          <div className={styles.metricFooter}>
            <span
              className={`${styles.metricChange} ${variacao >= 0 ? styles.changePositive : styles.changeNegative}`}
            >
              {variacao >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {Math.abs(variacao).toFixed(1)}%
            </span>
            <span className={styles.metricPeriod}>vs periodo anterior</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Ticket Medio</span>
            <div className={`${styles.metricIcon} ${styles.iconBlue}`}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {handleFormatCoin(stats.ticketMedio)}
          </div>
          <div className={styles.metricFooter}>
            <span className={styles.metricPeriod}>por venda</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Produtos Vendidos</span>
            <div className={`${styles.metricIcon} ${styles.iconPink}`}>
              <Package size={20} />
            </div>
          </div>
          <div className={styles.metricValue}>{stats.produtosVendidos}</div>
          <div className={styles.metricFooter}>
            <span className={styles.metricPeriod}>unidades</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total de Produtos</span>
            <div className={`${styles.metricIcon} ${styles.iconOrange}`}>
              <Package size={20} />
            </div>
          </div>
          <div className={styles.metricValue}>{stats.totalProdutos}</div>
          <div className={styles.metricFooter}>
            <span className={styles.metricPeriod}>no catalogo</span>
          </div>
        </div>
      </div>

      <div className={styles.cardsRow}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Melhor Vendedor</h2>
            <div className={`${styles.sectionIcon} ${styles.iconGreen}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.sectionContent}>
            {stats.vendedorTop ? (
              <div className={styles.topItem}>
                <div className={styles.topRank}>1</div>
                <div className={styles.topInfo}>
                  <span className={styles.topName}>{stats.vendedorTop.nome}</span>
                  <span className={styles.topValue}>
                    {handleFormatCoin(stats.vendedorTop.total)} em vendas
                  </span>
                </div>
              </div>
            ) : (
              <p className={styles.emptyText}>Sem vendas no periodo</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Produto Mais Vendido</h2>
            <div className={`${styles.sectionIcon} ${styles.iconPink}`}>
              <Package size={20} />
            </div>
          </div>
          <div className={styles.sectionContent}>
            {stats.produtoTop ? (
              <div className={styles.topItem}>
                <div className={styles.topRank}>1</div>
                <div className={styles.topInfo}>
                  <span className={styles.topName}>{stats.produtoTop.nome}</span>
                  <span className={styles.topValue}>
                    {stats.produtoTop.quantidade} unidades vendidas
                  </span>
                </div>
              </div>
            ) : (
              <p className={styles.emptyText}>Sem vendas no periodo</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Comparativo de Vendas</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.comparativoGrid}>
            <div className={styles.comparativoItem}>
              <span className={styles.comparativoLabel}>Periodo Atual</span>
              <span className={styles.comparativoValue}>
                {handleFormatCoin(stats.comparativo.atual)}
              </span>
            </div>
            <div className={styles.comparativoVs}>VS</div>
            <div className={styles.comparativoItem}>
              <span className={styles.comparativoLabel}>Periodo Anterior</span>
              <span className={styles.comparativoValue}>
                {handleFormatCoin(stats.comparativo.anterior)}
              </span>
            </div>
          </div>
          <div className={styles.comparativoResult}>
            {variacao >= 0 ? (
              <span className={styles.resultPositive}>
                <TrendingUp size={20} />
                Aumento de {variacao.toFixed(1)}%
              </span>
            ) : (
              <span className={styles.resultNegative}>
                <TrendingDown size={20} />
                Queda de {Math.abs(variacao).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
