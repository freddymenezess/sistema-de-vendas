import { useEffect, useState } from "react";
import { getItem } from "@services/storage";
import styles from "./Vendas.module.css";

function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [groupBy, setGroupBy] = useState("day"); // 'day' or 'month'

  useEffect(() => {
    const stored = getItem("compras") || [];
    setVendas(stored.reverse()); // mais recentes primeiro
  }, []);

  const groupedSales = vendas.reduce((acc, venda) => {
    const date = new Date(venda.data);
    const key =
      groupBy === "day"
        ? date.toLocaleDateString("pt-PT")
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(venda);
    return acc;
  }, {});

  // Ordenar grupos por data decrescente
  const sortedGroups = Object.entries(groupedSales).sort(
    ([a], [b]) => new Date(b) - new Date(a),
  );

  const totalGeral = vendas.reduce((acc, venda) => acc + venda.total, 0);

  const printReport = (groupKey) => {
    // Simples: imprime a página. Para relatório específico, poderia usar uma biblioteca como jsPDF
    window.print();
  };

  return (
    <div className={styles.container}>
      <header>
        <h2>Relatório de Vendas</h2>
        <p className="subt">
          Analise dados detalhados para tomar decisões estratégicas
        </p>
        <div className={styles.groupToggle}>
          <button
            className={groupBy === "day" ? styles.active : ""}
            onClick={() => setGroupBy("day")}
          >
            Agrupar por Dia
          </button>
          <button
            className={groupBy === "month" ? styles.active : ""}
            onClick={() => setGroupBy("month")}
          >
            Agrupar por Mês
          </button>
        </div>
      </header>

      <div className={styles.kpis}>
        <div className={styles.kpiCard}>
          <span>Total de Vendas</span>
          <strong>{vendas.length}</strong>
        </div>

        <div className={styles.kpiCard}>
          <span>Faturamento Total</span>
          <strong>{totalGeral.toLocaleString()} Kz</strong>
        </div>
      </div>

      <div className={styles.salesList}>
        {vendas.length === 0 && (
          <p className={styles.empty}>Nenhuma venda realizada ainda.</p>
        )}

        {sortedGroups.map(([groupKey, sales]) => {
          const groupTotal = sales.reduce((acc, venda) => acc + venda.total, 0);
          return (
            <div key={groupKey} className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>{groupKey}</h3>
                <span>Total: {groupTotal.toLocaleString()} Kz</span>
                <button
                  className={styles.printBtn}
                  onClick={() => printReport(groupKey)}
                >
                  Imprimir Relatório
                </button>
              </div>
              {sales.map((venda) => (
                <div key={venda.idCompra} className={styles.saleCard}>
                  <div className={styles.saleHeader}>
                    <div>
                      <strong>Compra #{venda.idCompra}</strong>
                      <p>{new Date(venda.data).toLocaleString()}</p>
                    </div>

                    <div className={styles.total}>
                      {venda.total.toLocaleString()} Kz
                    </div>
                  </div>

                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Preço Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venda.produtos.map((produto) => (
                        <tr key={produto.id}>
                          <td>{produto.name}</td>
                          <td>{produto.quantidade}</td>
                          <td>{produto.preco.toLocaleString()} Kz</td>
                          <td>{produto.preco_pagar.toLocaleString()} Kz</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Vendas;
