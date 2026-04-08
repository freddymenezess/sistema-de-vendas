import { useEffect, useState, useMemo } from "react";
import { getItem } from "@services/storage";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  TrendingUp,
  Receipt,
  CalendarToday,
  CalendarMonth,
  FileDownload,
  ShoppingCart,
  AttachMoney,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import styles from "./Vendas.module.css";

function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [groupBy, setGroupBy] = useState("day");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored = getItem("compras") || [];
    setVendas(stored.reverse());
  }, []);

  const filteredVendas = useMemo(() => {
    if (!searchTerm) return vendas;
    return vendas.filter(
      (venda) =>
        venda.idCompra?.toString().includes(searchTerm) ||
        venda.produtos?.some((p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [vendas, searchTerm]);

  const groupedSales = useMemo(() => {
    return filteredVendas.reduce((acc, venda) => {
      const date = new Date(venda.data);
      const key =
        groupBy === "day"
          ? date.toLocaleDateString("pt-PT")
          : `${date.toLocaleString("pt-PT", { month: "long" })} ${date.getFullYear()}`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(venda);
      return acc;
    }, {});
  }, [filteredVendas, groupBy]);

  const sortedGroups = useMemo(() => {
    return Object.entries(groupedSales).sort(([a], [b]) => {
      const dateA = new Date(a.split("/").reverse().join("-"));
      const dateB = new Date(b.split("/").reverse().join("-"));
      return dateB - dateA;
    });
  }, [groupedSales]);

  const stats = useMemo(() => {
    const totalGeral = filteredVendas.reduce((acc, v) => acc + v.total, 0);
    const totalItens = filteredVendas.reduce(
      (acc, v) => acc + v.produtos.reduce((a, p) => a + p.quantidade, 0),
      0
    );
    const ticketMedio =
      filteredVendas.length > 0 ? totalGeral / filteredVendas.length : 0;

    return { totalGeral, totalItens, ticketMedio };
  }, [filteredVendas]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const generatePDF = (groupKey, sales) => {
    const doc = new jsPDF();
    const groupTotal = sales.reduce((acc, v) => acc + v.total, 0);

    // Header
    doc.setFillColor(212, 163, 115);
    doc.rect(0, 0, 220, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Vendas", 14, 22);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Período: ${groupKey}`, 14, 32);

    // Reset colors
    doc.setTextColor(0, 0, 0);

    // Summary box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 55, 182, 30, 3, 3, "F");

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Total de Vendas", 24, 66);
    doc.text("Faturamento", 90, 66);
    doc.text("Data do Relatório", 150, 66);

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(`${sales.length}`, 24, 78);
    doc.text(`${groupTotal.toLocaleString()} Kz`, 90, 78);
    doc.text(new Date().toLocaleDateString("pt-PT"), 150, 78);

    // Sales table
    let yPosition = 100;

    sales.forEach((venda, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Sale header
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(14, yPosition, 182, 12, 2, 2, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(`Venda #${venda.idCompra}`, 18, yPosition + 8);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        new Date(venda.data).toLocaleString("pt-PT"),
        80,
        yPosition + 8
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(212, 163, 115);
      doc.text(`${venda.total.toLocaleString()} Kz`, 160, yPosition + 8);

      yPosition += 16;

      // Products table
      const tableData = venda.produtos.map((p) => [
        p.name,
        p.quantidade.toString(),
        `${p.preco.toLocaleString()} Kz`,
        `${p.preco_pagar.toLocaleString()} Kz`,
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Produto", "Qtd", "Preço Unit.", "Subtotal"]],
        body: tableData,
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [212, 163, 115],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252],
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 40, halign: "right" },
          3: { cellWidth: 40, halign: "right" },
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} | Gerado automaticamente pelo sistema`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`relatorio-vendas-${groupKey.replace(/\//g, "-")}.pdf`);
  };

  const generateFullReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(212, 163, 115);
    doc.rect(0, 0, 220, 50, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório Completo de Vendas", 14, 24);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-PT")}`, 14, 36);

    // Reset colors
    doc.setTextColor(0, 0, 0);

    // Stats cards
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 60, 55, 35, 3, 3, "F");
    doc.roundedRect(77, 60, 55, 35, 3, 3, "F");
    doc.roundedRect(140, 60, 55, 35, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Total de Vendas", 20, 72);
    doc.text("Faturamento Total", 83, 72);
    doc.text("Ticket Médio", 146, 72);

    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(`${vendas.length}`, 20, 86);
    doc.text(`${stats.totalGeral.toLocaleString()} Kz`, 83, 86);
    doc.text(`${Math.round(stats.ticketMedio).toLocaleString()} Kz`, 146, 86);

    // All sales table
    const allTableData = vendas.map((v) => [
      `#${v.idCompra}`,
      new Date(v.data).toLocaleDateString("pt-PT"),
      v.produtos.length.toString(),
      `${v.total.toLocaleString()} Kz`,
    ]);

    doc.autoTable({
      startY: 110,
      head: [["ID", "Data", "Itens", "Total"]],
      body: allTableData,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [212, 163, 115],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} | Gerado automaticamente pelo sistema`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`relatorio-completo-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <div>
              <h1>Relatório de Vendas</h1>
              <p>Analise dados detalhados para tomar decisões estratégicas</p>
            </div>
          </div>

          <button className={styles.exportBtn} onClick={generateFullReport}>
            <FileDownload />
            Exportar Completo
          </button>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Pesquisar por ID ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.groupToggle}>
            <button
              className={groupBy === "day" ? styles.active : ""}
              onClick={() => setGroupBy("day")}
            >
              <CalendarToday />
              Por Dia
            </button>
            <button
              className={groupBy === "month" ? styles.active : ""}
              onClick={() => setGroupBy("month")}
            >
              <CalendarMonth />
              Por Mês
            </button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className={styles.kpiSection}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} data-color="primary">
            <ShoppingCart />
          </div>
          <div className={styles.kpiInfo}>
            <span>Total de Vendas</span>
            <strong>{filteredVendas.length}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} data-color="success">
            <AttachMoney />
          </div>
          <div className={styles.kpiInfo}>
            <span>Faturamento Total</span>
            <strong>{stats.totalGeral.toLocaleString()} Kz</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} data-color="info">
            <Receipt />
          </div>
          <div className={styles.kpiInfo}>
            <span>Ticket Médio</span>
            <strong>{Math.round(stats.ticketMedio).toLocaleString()} Kz</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} data-color="warning">
            <TrendingUp />
          </div>
          <div className={styles.kpiInfo}>
            <span>Itens Vendidos</span>
            <strong>{stats.totalItens}</strong>
          </div>
        </div>
      </section>

      {/* Sales List */}
      <section className={styles.salesSection}>
        {filteredVendas.length === 0 ? (
          <div className={styles.emptyState}>
            <Receipt />
            <h3>Nenhuma venda encontrada</h3>
            <p>
              {searchTerm
                ? "Tente ajustar os filtros de pesquisa"
                : "As vendas realizadas aparecerão aqui"}
            </p>
          </div>
        ) : (
          <div className={styles.groupList}>
            {sortedGroups.map(([groupKey, sales]) => {
              const groupTotal = sales.reduce((acc, v) => acc + v.total, 0);
              const isExpanded = expandedGroups[groupKey] !== false;

              return (
                <div key={groupKey} className={styles.group}>
                  <div
                    className={styles.groupHeader}
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <div className={styles.groupInfo}>
                      <div className={styles.groupDate}>
                        {groupBy === "day" ? <CalendarToday /> : <CalendarMonth />}
                        <h3>{groupKey}</h3>
                      </div>
                      <div className={styles.groupMeta}>
                        <span className={styles.salesCount}>
                          {sales.length} {sales.length === 1 ? "venda" : "vendas"}
                        </span>
                        <span className={styles.groupTotal}>
                          {groupTotal.toLocaleString()} Kz
                        </span>
                      </div>
                    </div>

                    <div className={styles.groupActions}>
                      <button
                        className={styles.printBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePDF(groupKey, sales);
                        }}
                      >
                        <FileDownload />
                        PDF
                      </button>
                      <button className={styles.expandBtn}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.salesList}>
                      {sales.map((venda) => (
                        <div key={venda.idCompra} className={styles.saleCard}>
                          <div className={styles.saleHeader}>
                            <div className={styles.saleInfo}>
                              <span className={styles.saleId}>
                                #{venda.idCompra}
                              </span>
                              <span className={styles.saleDate}>
                                {new Date(venda.data).toLocaleString("pt-PT")}
                              </span>
                            </div>
                            <div className={styles.saleTotal}>
                              {venda.total.toLocaleString()} Kz
                            </div>
                          </div>

                          <div className={styles.productsList}>
                            {venda.produtos.map((produto, idx) => (
                              <div key={idx} className={styles.productItem}>
                                <div className={styles.productInfo}>
                                  <span className={styles.productName}>
                                    {produto.name}
                                  </span>
                                  <span className={styles.productQty}>
                                    {produto.quantidade}x {produto.preco.toLocaleString()} Kz
                                  </span>
                                </div>
                                <span className={styles.productTotal}>
                                  {produto.preco_pagar.toLocaleString()} Kz
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Vendas;
