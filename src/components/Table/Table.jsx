import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Table.module.css";

function Table({ titles, objArray }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {
            titles.map((title, index) => (
              <th key={index}>{title}</th>
            ))
          }
        </tr>
      </thead>
      <tbody>
        {objArray.map((prop) => (
          <tr key={prop.id}>
            <td>{prop.name}</td>
            <td>{prop.stock}</td>
            <td>{handleFormatCoin(prop.price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
