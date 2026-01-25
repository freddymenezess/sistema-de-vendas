import Card from '@components/Card/Card'
import { ShoppingCart } from 'lucide-react';
import { handleFormatCoin } from '@utils/handleFormatCoin';
import styles from './SalesStatistics.module.css';

function SalesStatistics() {
  return (
    <div className={styles.dashboard}>
      <Card
        className={styles.chart}
        icon={ShoppingCart}
        color={'#0000ff'}
        desc={'Total de vendas hoje'}
        dest={handleFormatCoin(52000)}
      />
    </div>
  );
}

export default SalesStatistics;
