import { DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const vendasHoje = 125000;

  const funcionariosOnline = [
    { id: 1, nome: "Ana" },
    { id: 2, nome: "Carlos" },
    { id: 3, nome: "João" },
  ];

  const produtosMaisVendidos = [
    { id: 1, nome: "Refrigerante", vendas: 120 },
    { id: 2, nome: "Açúcar", vendas: 98 },
    { id: 3, nome: "Arroz 5kg", vendas: 80 },
  ];

  const produtosBaixoEstoque = [
    { id: 1, nome: "Óleo 1L", estoque: 4 },
    { id: 2, nome: "Arroz 5kg", estoque: 2 },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Destaque principal */}
      <div className={styles.destaque}>
        <strong>
          <DollarSign size={48} />
        </strong>
        <div>
          <span>Total vendido hoje</span>
          <h1 className={styles.price}>
            <strong>{vendasHoje.toLocaleString()} Kz</strong>
          </h1>
        </div>
      </div>

      <div className={styles.cards}>
        {/* Funcionários online */}
        <div className={styles.card}>
          <header>
            <Users />
            <h2>Funcionários online</h2>
            <span className={styles.badge}>{funcionariosOnline.length}</span>
          </header>
          <ul>
            {funcionariosOnline.map((f) => (
              <li key={f.id}>
                {f.nome}
                <span className={`${styles.status} ${styles.online}`} />
              </li>
            ))}
          </ul>
        </div>

        {/* Produtos mais vendidos */}
        <div className={styles.card}>
          <header>
            <TrendingUp />
            <h2>Produtos mais vendidos</h2>
            <span className={styles.badge}>
              {produtosMaisVendidos.length}
            </span>
          </header>
          <ul>
            {produtosMaisVendidos.map((p) => (
              <li key={p.id}>
                {p.nome}
                <strong>{p.vendas}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Produtos em baixa */}
        <div className={`${styles.card} ${styles.alerta}`}>
          <header>
            <AlertTriangle className={styles.teste} />
            <h2>Estoque baixo</h2>
            <span className={`${styles.badge} ${styles.alerta}`}>
              {produtosBaixoEstoque.length}
            </span>
          </header>
          <ul>
            {produtosBaixoEstoque.map((p) => (
              <li key={p.id}>
                {p.nome}
                <strong className={styles.danger}>{p.estoque} un.</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
