import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@services/firebase";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import { showError } from "@utils/sweetAlert";
import styles from "./Relatorios.module.css";

function Relatorios() {
  const [periodo, setPeriodo] = useState("mes");
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      try {
        const [vendasSnap, produtosSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "vendas")),
          getDocs(collection(db, "produtos")),
          getDocs(collection(db, "users")),
        ]);

        setVendas(
          vendasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        setProdutos(
          produtosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        setUsers(usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showError(
          "Erro ao carregar",
          "Não foi possível carregar os dados dos relatórios. Tente novamente.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calcularRelatorios = useCallback(() => {
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
      dataInicioAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      dataFimAnterior = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    const vendasPeriodo = vendas.filter((v) => {
      const dataVenda = normalizeDate(v.data);
      return dataVenda && dataVenda >= dataInicio && dataVenda <= now;
    });

    const vendasAnterior = vendas.filter((v) => {
      const dataVenda = normalizeDate(v.data);
      return (
        dataVenda &&
        dataVenda >= dataInicioAnterior &&
        dataVenda < dataFimAnterior
      );
    });

    const totalVendas = vendasPeriodo.reduce(
      (acc, v) => acc + (v.total || 0),
      0,
    );
    const totalAnterior = vendasAnterior.reduce(
      (acc, v) => acc + (v.total || 0),
      0,
    );
    const ticketMedio =
      vendasPeriodo.length > 0 ? totalVendas / vendasPeriodo.length : 0;

    const produtosVendidos = vendasPeriodo.reduce((acc, v) => {
      return acc + (v.itens?.reduce((a, i) => a + (i.quantidade || 0), 0) || 0);
    }, 0);

    const vendedorVendas = {};
    vendasPeriodo.forEach((v) => {
      if (v.vendedorId) {
        vendedorVendas[v.vendedorId] =
          (vendedorVendas[v.vendedorId] || 0) + (v.total || 0);
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
  }, [periodo, vendas, produtos, users]);

  useEffect(() => {
    if (!loading) calcularRelatorios();
  }, [periodo, vendas, produtos, users, loading, calcularRelatorios]);

  const normalizeDate = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    return new Date(value);
  };

  const calcularVariacao = () => {
    const { atual, anterior } = stats.comparativo;
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const variacao = calcularVariacao();

  const handleImprimirRelatorio = () => {
    const periodoLabel = {
      dia: "Hoje",
      semana: "Esta Semana",
      mes: "Este Mês",
    }[periodo];
    const agora = new Date();
    const dataExportacao = agora.toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const horaExportacao = agora.toLocaleTimeString("pt-AO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const formatCoin = (v) =>
      new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
      }).format(v);

    const formatPayment = (p) =>
      ({
        dinheiro: "Dinheiro",
        cartao_credito: "Cartão de Crédito",
        cartao_debito: "Cartão de Débito",
      })[p] ||
      p ||
      "—";

    // ── Tabela 1: Detalhamento de vendas ──────────────────────────────
    const vendasOrdenadas = vendas
      .slice()
      .sort(
        (a, b) => (normalizeDate(b.data) || 0) - (normalizeDate(a.data) || 0),
      );

    let rowsVendas = "";
    let totalGeralVendas = 0;
    let totalGeralItens = 0;

    vendasOrdenadas.forEach((v, i) => {
      const dataVenda = normalizeDate(v.data);
      const totalVenda = v.total || 0;
      const qtdItens =
        v.itens?.reduce((a, it) => a + (it.quantidade || 0), 0) || 0;
      totalGeralVendas += totalVenda;
      totalGeralItens += qtdItens;
      const rowClass = i % 2 === 0 ? "" : ' class="stripe"';
      rowsVendas += `
        <tr${rowClass}>
          <td class="center">${i + 1}</td>
          <td>${dataVenda ? dataVenda.toLocaleDateString("pt-AO") : "—"}</td>
          <td>${dataVenda ? dataVenda.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
          <td>${v.vendedorNome || v.vendedorId || "—"}</td>
          <td class="center">${qtdItens}</td>
          <td>${formatPayment(v.formaPagamento)}</td>
          <td class="num">${handleFormatCoin(totalVenda)}</td>
        </tr>`;
    });

    rowsVendas += `
      <tr class="total-row">
        <td colspan="4"><strong>TOTAL GERAL</strong></td>
        <td class="center"><strong>${totalGeralItens}</strong></td>
        <td></td>
        <td class="num"><strong>${handleFormatCoin(totalGeralVendas)}</strong></td>
      </tr>`;

    // ── Tabela 2: Produtos mais vendidos ──────────────────────────────
    const produtoMap = {};
    vendas.forEach((v) => {
      v.itens?.forEach((item) => {
        const id = item.produtoId || item.id || item.nome;
        if (!id) return;
        if (!produtoMap[id]) {
          produtoMap[id] = { nome: item.nome || "—", quantidade: 0, total: 0 };
        }
        produtoMap[id].quantidade += item.quantidade || 0;
        produtoMap[id].total +=
          item.subtotal || (item.preco || 0) * (item.quantidade || 0);
      });
    });

    const produtosRanking = Object.values(produtoMap).sort(
      (a, b) => b.quantidade - a.quantidade,
    );

    let rowsProdutos = "";
    let totalQtdProdutos = 0;
    let totalReceitaProdutos = 0;

    produtosRanking.forEach((p, i) => {
      totalQtdProdutos += p.quantidade;
      totalReceitaProdutos += p.total;
      const rowClass = i % 2 === 0 ? "" : ' class="stripe"';
      rowsProdutos += `
        <tr${rowClass}>
          <td class="center">${i + 1}º</td>
          <td>${p.nome}</td>
          <td class="center">${p.quantidade}</td>
          <td class="num">${p.total > 0 ? handleFormatCoin(p.total) : "—"}</td>
          <td class="center">${totalQtdProdutos > 0 ? ((p.quantidade / totalQtdProdutos) * 100).toFixed(1) + "%" : "—"}</td>
        </tr>`;
    });

    if (produtosRanking.length === 0) {
      rowsProdutos = `<tr><td colspan="5" class="empty">Nenhum produto vendido no período</td></tr>`;
    } else {
      rowsProdutos += `
        <tr class="total-row">
          <td colspan="2"><strong>TOTAL</strong></td>
          <td class="center"><strong>${totalQtdProdutos}</strong></td>
          <td class="num"><strong>${formatCoin(totalReceitaProdutos)}</strong></td>
          <td class="center"><strong>100%</strong></td>
        </tr>`;
    }

    // ── Tabela 3: Vendas por vendedor ─────────────────────────────────
    const vendedorMap = {};
    vendas.forEach((v) => {
      const id = v.vendedorId || "desconhecido";
      if (!vendedorMap[id]) {
        const user = users.find((u) => u.id === id);
        vendedorMap[id] = {
          nome: user?.nome || v.vendedorNome || "—",
          qtdVendas: 0,
          total: 0,
        };
      }
      vendedorMap[id].qtdVendas += 1;
      vendedorMap[id].total += v.total || 0;
    });

    const vendedoresRanking = Object.values(vendedorMap).sort(
      (a, b) => b.total - a.total,
    );

    const totalVendasGeral = vendedoresRanking.reduce((a, v) => a + v.total, 0);

    let rowsVendedores = "";
    vendedoresRanking.forEach((v, i) => {
      const rowClass = i % 2 === 0 ? "" : ' class="stripe"';
      const participacao =
        totalVendasGeral > 0
          ? ((v.total / totalVendasGeral) * 100).toFixed(1)
          : "0.0";
      const ticketVendedor = v.qtdVendas > 0 ? v.total / v.qtdVendas : 0;
      rowsVendedores += `
        <tr${rowClass}>
          <td class="center">${i + 1}º</td>
          <td>${v.nome}</td>
          <td class="center">${v.qtdVendas}</td>
          <td class="num">${formatCoin(ticketVendedor)}</td>
          <td class="num">${formatCoin(v.total)}</td>
          <td class="center">${participacao}%</td>
        </tr>`;
    });

    if (vendedoresRanking.length === 0) {
      rowsVendedores = `<tr><td colspan="6" class="empty">Nenhuma venda registrada no período</td></tr>`;
    }

    // ── Tabela 4: Formas de pagamento ─────────────────────────────────
    const pagamentoMap = {};
    vendas.forEach((v) => {
      const forma = v.formaPagamento || "outros";
      if (!pagamentoMap[forma]) pagamentoMap[forma] = { qtd: 0, total: 0 };
      pagamentoMap[forma].qtd += 1;
      pagamentoMap[forma].total += v.total || 0;
    });

    const totalPagamentos = Object.values(pagamentoMap).reduce(
      (a, p) => a + p.total,
      0,
    );

    let rowsPagamento = "";
    Object.entries(pagamentoMap)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([forma, dados], i) => {
        const rowClass = i % 2 === 0 ? "" : ' class="stripe"';
        const pct =
          totalPagamentos > 0
            ? ((dados.total / totalPagamentos) * 100).toFixed(1)
            : "0.0";
        const barWidth =
          totalPagamentos > 0
            ? Math.round((dados.total / totalPagamentos) * 120)
            : 0;
        rowsPagamento += `
          <tr${rowClass}>
            <td>${formatPayment(forma)}</td>
            <td class="center">${dados.qtd}</td>
            <td class="num">${formatCoin(dados.total)}</td>
            <td class="center">${pct}%</td>
            <td><div style="background:#1e40af;height:10px;width:${barWidth}px;border-radius:2px;display:inline-block"></div></td>
          </tr>`;
      });

    if (!rowsPagamento) {
      rowsPagamento = `<tr><td colspan="5" class="empty">Nenhum dado disponível</td></tr>`;
    }

    // ── HTML final ────────────────────────────────────────────────────
    const variacaoTexto =
      variacao >= 0
        ? `▲ ${variacao.toFixed(1)}% acima do período anterior`
        : `▼ ${Math.abs(variacao).toFixed(1)}% abaixo do período anterior`;
    const variacaoCor = variacao >= 0 ? "#15803d" : "#b91c1c";

    const html = `
      <!DOCTYPE html>
        <html lang="pt-AO">
        <head>
          <meta charset="UTF-8"/>
          <title>Relatório de Vendas — ${periodoLabel}</title>
          <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              color: #111;
              background: #fff;
              padding: 28px 36px;
            }

            /* ── Topo institucional ── */
            .cover {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #1e40af;
              padding-bottom: 14px;
              margin-bottom: 20px;
            }
            .cover-left h1 {
              font-size: 18px;
              font-weight: 700;
              color: #1e3a8a;
              letter-spacing: -.3px;
              margin-bottom: 3px;
            }
            .cover-left p { font-size: 11px; color: #6b7280; }
            .cover-right { text-align: right; font-size: 10px; color: #6b7280; line-height: 1.7; }
            .cover-right strong { color: #1e3a8a; font-size: 12px; }

            /* ── Ficha de sumário ── */
            .summary {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 0;
              border: 1px solid #cbd5e1;
              margin-bottom: 24px;
            }
            .summary-cell {
              padding: 10px 12px;
              border-right: 1px solid #cbd5e1;
            }
            .summary-cell:last-child { border-right: none; }
            .summary-cell .s-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: .06em;
              color: #64748b;
              margin-bottom: 4px;
            }
            .summary-cell .s-value {
              font-size: 15px;
              font-weight: 700;
              color: #1e3a8a;
            }
            .summary-cell .s-sub { font-size: 9px; color: #94a3b8; margin-top: 3px; }
            .summary-cell.variacao .s-value { font-size: 12px; color: ${variacaoCor}; }

            /* ── Título de seção ── */
            .section-heading {
              background: #1e3a8a;
              color: #fff;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: .07em;
              padding: 7px 10px;
              margin-bottom: 0;
              margin-top: 24px;
            }
            .section-heading:first-of-type { margin-top: 0; }

            /* ── Tabelas ── */
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10.5px;
              margin-bottom: 0;
            }
            thead tr { background: #dbeafe; }
            thead th {
              padding: 7px 9px;
              font-size: 9.5px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: .05em;
              color: #1e40af;
              border: 1px solid #bfdbfe;
              text-align: left;
              white-space: nowrap;
            }
            tbody td {
              padding: 6px 9px;
              border: 1px solid #e2e8f0;
              color: #1e293b;
              vertical-align: middle;
            }
            tbody tr.stripe td { background: #f8fafc; }
            tbody tr:hover td { background: #eff6ff; }
            tr.total-row td {
              background: #e0f2fe;
              border-top: 2px solid #1e40af;
              font-size: 10.5px;
            }
            td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
            td.center { text-align: center; }
            td.empty { text-align: center; color: #94a3b8; padding: 16px; font-style: italic; }

            /* ── Rodapé ── */
            .footer {
              margin-top: 28px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #94a3b8;
            }

            /* ── Impressão ── */
            @media print {
              body { padding: 0; }
              @page { margin: 12mm 14mm; size: A4; }
              .section-heading { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              tbody tr.stripe td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              tr.total-row td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .summary-cell { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>

          <!-- Cabeçalho institucional -->
          <div class="cover">
            <div class="cover-left">
              <h1>Relatório de Vendas</h1>
              <p>Período: <strong>${periodoLabel}</strong> &nbsp;|&nbsp; Documento confidencial — uso interno</p>
            </div>
            <div class="cover-right">
              <strong>Gerado em ${dataExportacao}</strong><br>
              às ${horaExportacao}<br>
              Total de registros: ${vendas.length}
            </div>
          </div>

          <!-- Sumário executivo -->
          <div class="summary">
            <div class="summary-cell">
              <div class="s-label">Total de Vendas</div>
              <div class="s-value">${formatCoin(stats.totalVendas)}</div>
              <div class="s-sub">receita no período</div>
            </div>
            <div class="summary-cell">
              <div class="s-label">Nº de Vendas</div>
              <div class="s-value">${vendas.length}</div>
              <div class="s-sub">transações</div>
            </div>
            <div class="summary-cell">
              <div class="s-label">Ticket Médio</div>
              <div class="s-value">${formatCoin(stats.ticketMedio)}</div>
              <div class="s-sub">por venda</div>
            </div>
            <div class="summary-cell">
              <div class="s-label">Itens Vendidos</div>
              <div class="s-value">${stats.produtosVendidos}</div>
              <div class="s-sub">unidades</div>
            </div>
            <div class="summary-cell variacao">
              <div class="s-label">Variação</div>
              <div class="s-value">${variacaoTexto}</div>
              <div class="s-sub">${formatCoin(stats.comparativo.anterior)} no período anterior</div>
            </div>
          </div>

          <!-- Tabela 1: Detalhamento das vendas -->
          <div class="section-heading">1. Detalhamento das Vendas</div>
          <table>
            <thead>
              <tr>
                <th style="width:36px">#</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Vendedor</th>
                <th style="width:60px">Qtd. Itens</th>
                <th>Pagamento</th>
                <th style="width:110px">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsVendas || `<tr><td colspan="7" class="empty">Nenhuma venda registrada</td></tr>`}
            </tbody>
          </table>

          <!-- Tabela 2: Produtos mais vendidos -->
          <div class="section-heading">2. Produtos Mais Vendidos</div>
          <table>
            <thead>
              <tr>
                <th style="width:40px">Rank</th>
                <th>Produto</th>
                <th style="width:80px">Qtd. Vendida</th>
                <th style="width:110px">Receita Gerada</th>
                <th style="width:80px">% do Total</th>
              </tr>
            </thead>
            <tbody>${rowsProdutos}</tbody>
          </table>

          <!-- Tabela 3: Desempenho por vendedor -->
          <div class="section-heading">3. Desempenho por Vendedor</div>
          <table>
            <thead>
              <tr>
                <th style="width:40px">Rank</th>
                <th>Vendedor</th>
                <th style="width:80px">Nº Vendas</th>
                <th style="width:110px">Ticket Médio</th>
                <th style="width:110px">Total Vendido</th>
                <th style="width:80px">Participação</th>
              </tr>
            </thead>
            <tbody>${rowsVendedores}</tbody>
          </table>

          <!-- Tabela 4: Formas de pagamento -->
          <div class="section-heading">4. Vendas por Forma de Pagamento</div>
          <table>
            <thead>
              <tr>
                <th>Forma de Pagamento</th>
                <th style="width:80px">Nº Vendas</th>
                <th style="width:110px">Total</th>
                <th style="width:60px">%</th>
                <th>Proporção</th>
              </tr>
            </thead>
            <tbody>${rowsPagamento}</tbody>
          </table>

          <div class="footer">
            <span>Documento gerado automaticamente pelo sistema de gestão de vendas.</span>
            <span>${dataExportacao} — ${horaExportacao}</span>
          </div>

        </body>
        </html>
    `;

    const printWindow = window.open("", "_blank", "width=1024,height=800");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 className={styles.loadingSpinner} size={32} />
        <p className={styles.loadingText}>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Relatórios</h1>
        <p className={styles.welcomeSubtitle}>
          Analise os dados do seu negócio
        </p>
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
            Mês
          </button>
        </div>
        <button
          onClick={handleImprimirRelatorio}
          className={styles.exportButton}
        >
          <Download size={18} />
          Imprimir Relatório
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
            <span className={styles.metricPeriod}>vs período anterior</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Ticket Médio</span>
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
            <span className={styles.metricPeriod}>no catálogo</span>
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
                  <span className={styles.topName}>
                    {stats.vendedorTop.nome}
                  </span>
                  <span className={styles.topValue}>
                    {handleFormatCoin(stats.vendedorTop.total)} em vendas
                  </span>
                </div>
              </div>
            ) : (
              <p className={styles.emptyText}>Sem vendas no período</p>
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
                  <span className={styles.topName}>
                    {stats.produtoTop.nome}
                  </span>
                  <span className={styles.topValue}>
                    {stats.produtoTop.quantidade} unidades vendidas
                  </span>
                </div>
              </div>
            ) : (
              <p className={styles.emptyText}>Sem vendas no período</p>
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
              <span className={styles.comparativoLabel}>Período Atual</span>
              <span className={styles.comparativoValue}>
                {handleFormatCoin(stats.comparativo.atual)}
              </span>
            </div>
            <div className={styles.comparativoVs}>VS</div>
            <div className={styles.comparativoItem}>
              <span className={styles.comparativoLabel}>Período Anterior</span>
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
