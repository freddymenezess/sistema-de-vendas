import { TrendingUp } from "lucide-react";
import LowStock from "@widgets/LowStock/LowStock";
import OnStaff from "@widgets/OnStaff/OnStaff";
import Statics from "@widgets/Statics/Statics";
import SalesChart from "@components/SalesChart/SalesChart";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const produtosMaisVendidos = [
    { id: 1, nome: "Refrigerante", vendas: 120 },
    { id: 2, nome: "Açúcar", vendas: 98 },
    { id: 3, nome: "Arroz 5kg", vendas: 80 },
  ];

  return (
    <div className={styles.dashboard}>
      <Statics />
      <OnStaff />
      <LowStock />
      <SalesChart />
      {/* Destaque principal */}
      

      <div className={styles.cards}>
        {/* Funcionários online */}
        

        {/* Produtos mais vendidos */}
        <div className={styles.card}>
          <header>
            <TrendingUp />
            <h2>Produtos mais vendidos</h2>
            <span className={styles.badge}>{produtosMaisVendidos.length}</span>
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
        
      </div>
      <p>Página em desenvolvimento</p>
    </div>
  );
}

export default Dashboard;
