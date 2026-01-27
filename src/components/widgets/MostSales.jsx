import { TrendingUp } from "lucide-react";
import Card from "@components/Card/Card";
import Table from "@components/Table/Table"

const produtosMaisVendidos = [
  {
    id: 1,
    name: "Bronzeador",
    stock: 20,
    price: 7500,
  },
  {
    id: 2,
    name: "MATELOT",
    stock: 4,
    price: 9000,
  },
  {
    id: 3,
    name: "Óleo da pele",
    stock: 10,
    price: 2000,
  },
  {
    id: 4,
    name: "Batom",
    stock: 121,
    price: 3500,
  }
];

const titles = ["PRODUTOS", "EM STOCK", "PREÇO"];

function MostSales({ className }) {
  return (
    <Card
      className={className}
      icon={TrendingUp}
      desc={"Estatísticas"}
      dest={"PRODUTOS MAIS VENDIDOS"}
    >
      <Table titles={titles} objArray={produtosMaisVendidos} />
    </Card>
  );
}

export default MostSales;
