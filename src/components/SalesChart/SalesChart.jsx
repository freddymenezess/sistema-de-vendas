import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import BoxShadow from "@components/BoxShadow/BoxShadow";
import { getItem } from "@services/storage.js";
import styles from "./SalesChart.module.css";

const formatCurrency = (value) =>
  value.toLocaleString("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  });

const SalesChart = ({ className }) => {
  const data = getItem("salesChart");

  return (
    <BoxShadow className={className}>
      <div className={styles.salesChartContainer}>
        <h2 className={styles.title}>Estatísticas de vendas</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              dataKey="vendas"
              tickFormatter={(value) =>
                value.toLocaleString("pt-AO", {
                  style: "currency",
                  currency: "AOA",
                })
              }
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(label) => `Mês: ${label}`}
            />

            <Line
              type="monotone"
              dataKey="vendas"
              stroke="#d97706"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </BoxShadow>
  );
};

export default SalesChart;
