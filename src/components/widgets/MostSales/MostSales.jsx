import { TrendingUp } from 'lucide-react';
import { handleFormatCoin } from '@utils/handleFormatCoin';
import Card from '@components/Card/Card'
import styles from './MostSales.module.css';

const produtosMaisVendidos = [
  {
    id: 1,
    name: 'Bronzeador',
    stock: 20,
    price: 7500,
  },
  {
    id: 2,
    name: 'MATELOT',
    stock: 4,
    price: 9000,
  },
  {
    id: 3,
    name: 'Óleo da pele',
    stock: 10,
    price: 2000,
  },
  {
    id: 4,
    name: 'Batom',
    stock: 121,
    price: 3500,
  }
];

function MostSales() {
  return (
    <Card
      icon={TrendingUp}
      color={'#3bcc0f'}
      desc={'Estatísticas'}
      dest={'PRODUTOS MAIS VENDIDOS'}
    >
      <table className={styles.table}>
        <thead>
          <th>PRODUTO</th>
          <th>EM STOCK</th>
          <th>PREÇO</th>
        </thead>
        <tbody>
          {produtosMaisVendidos.map((p) => (
            <tr>
              <td>{p.name}</td>
              <td>{p.stock}</td>
              <td>{handleFormatCoin(p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default MostSales;
