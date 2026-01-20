import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import sales from '@data/salesChart.json';
import styles from "./SalesChart.module.css";

const formatCurrency = (value) =>
  value.toLocaleString("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  });

const SalesChart = () => {
  const data = sales;

  return (
    <div className={styles.salesChartContainer}>
      <h2 className={styles.title}>Estatísticas de Vendas 2025</h2>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelFormatter={(label) => `Mês: ${label}`}
          />
          <Bar dataKey="vendas" fill="#4CAF50" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
      
    </div>
  );
};

export default SalesChart;
