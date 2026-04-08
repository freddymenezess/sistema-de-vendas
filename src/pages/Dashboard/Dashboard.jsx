import { useMemo } from "react";
import { ShoppingCart, DollarSign, Package, Users } from "lucide-react";
import { getItem } from "@services/storage";
import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const user = getItem("currentUser");
  const compras = getItem("compras") || [];
  const products = getItem("products") || [];
  const users = getItem("users") || [];

  const stats = useMemo(() => {
    const totalVendido = compras.reduce((acc, c) => acc + c.total, 0);
    const totalVendas = compras.length;
    const totalProdutos = products.length;
    const totalFuncionarios = users.length;

    return {
      totalVendido,
      totalVendas,
      totalProdutos,
      totalFuncionarios,
    };
  }, [compras, products, users]);

  const vendasRecentes = useMemo(() => {
    return [...compras]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);
  }, [compras]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          Ola, {user?.nome?.split(" ")[0] || "Usuario"}!
        </h1>
        <p className={styles.welcomeSubtitle}>
          Confira o resumo das atividades
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPink}`}>
            <ShoppingCart size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Vendas</p>
            <p className={styles.statValue}>{stats.totalVendas}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Faturamento</p>
            <p className={styles.statValue}>{handleFormatCoin(stats.totalVendido)}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <Package size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Produtos</p>
            <p className={styles.statValue}>{stats.totalProdutos}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Funcionarios</p>
            <p className={styles.statValue}>{stats.totalFuncionarios}</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Vendas Recentes</h2>
        </div>
        <div className={styles.sectionContent}>
          {vendasRecentes.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingCart size={48} className={styles.emptyStateIcon} />
              <p>Nenhuma venda registrada ainda</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasRecentes.map((venda) => (
                    <tr key={venda.idCompra}>
                      <td>{formatDate(venda.data)}</td>
                      <td>{venda.produtos?.length || 0} itens</td>
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

export default Dashboard;
