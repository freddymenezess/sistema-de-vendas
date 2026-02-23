import { useEffect, useState } from "react";
import { getItem } from "@services/storage";
import styles from "./Vendas.module.css";

function Vendas() {
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    const stored = getItem("compras") || [];
    setVendas(stored.reverse()); // mais recentes primeiro
  }, []);

  const totalGeral = vendas.reduce((acc, venda) => acc + venda.total, 0);

  return (
    <div className={styles.container}>
      <h2>Relatório de Vendas</h2>

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

        {vendas.map((venda) => (
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
                    <td>{produto.nome}</td>
                    <td>{produto.quantidade}</td>
                    <td>{produto.preço.toLocaleString()} Kz</td>
                    <td>{produto.preco_pagar.toLocaleString()} Kz</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vendas;
