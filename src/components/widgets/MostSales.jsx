import { TrendingUp } from "lucide-react";
import products from "@data/products.json"
import Card from "@components/Card/Card";
import Table from "@components/Table/Table"

const produtosMaisVendidos = products;

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
