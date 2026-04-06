import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getItem } from "@services/storage.js";
import styles from "./SalesChart.module.css";

const formatCurrency = (value) =>
  value.toLocaleString("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  });

const SalesChart = ({ className }) => {
  const [groupBy, setGroupBy] = useState("month");
  const vendas = getItem("compras") || [];

  const chartData = useMemo(() => {
    if (!vendas || vendas.length === 0) return [];

    const grouped = vendas.reduce((acc, venda) => {
      const date = new Date(venda.data);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      let isoKey;
      let label;

      if (groupBy === "day") {
        isoKey = `${year}-${month}-${day}`;
        label = date.toLocaleDateString("pt-PT");
      } else if (groupBy === "month") {
        isoKey = `${year}-${month}`;
        label = `${month}/${year}`;
      } else {
        isoKey = `${year}`;
        label = `${year}`;
      }

      if (!acc[isoKey]) acc[isoKey] = { vendas: 0, label };
      acc[isoKey].vendas += venda.total;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([isoKey, { vendas, label }]) => ({ isoKey, vendas, label }))
      .sort((a, b) => (a.isoKey > b.isoKey ? 1 : -1));
  }, [vendas, groupBy]);

  return (
    <div className={`${styles.card} ${className || ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <BarChart3 size={24} />
          </div>
          <div>
            <span className={styles.subtitle}>Analise</span>
            <h3 className={styles.title}>Grafico de Vendas</h3>
          </div>
        </div>

        <div className={styles.groupToggle}>
          <button
            className={groupBy === "day" ? styles.active : ""}
            onClick={() => setGroupBy("day")}
          >
            Dia
          </button>
          <button
            className={groupBy === "month" ? styles.active : ""}
            onClick={() => setGroupBy("month")}
          >
            Mes
          </button>
          <button
            className={groupBy === "year" ? styles.active : ""}
            onClick={() => setGroupBy("year")}
          >
            Ano
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartArea}>
        {chartData.length === 0 ? (
          <div className={styles.emptyState}>
            <BarChart3 size={48} />
            <p>Sem vendas registradas para mostrar no grafico</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                dataKey="vendas" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => {
                  const prefix =
                    groupBy === "day"
                      ? "Dia"
                      : groupBy === "month"
                        ? "Mes"
                        : "Ano";
                  return `${prefix}: ${label}`;
                }}
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px',
                }}
                labelStyle={{ fontWeight: 600, color: '#1a1a2e' }}
              />

              <Line
                type="monotone"
                dataKey="vendas"
                stroke="#D4A373"
                strokeWidth={3}
                dot={{ r: 5, fill: '#D4A373', strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 8, fill: '#D4A373', strokeWidth: 3, stroke: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
