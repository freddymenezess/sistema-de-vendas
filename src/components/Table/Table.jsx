import { handleFormatCoin } from "@utils/handleFormatCoin";
import styles from "./Table.module.css";

function Table({ titles, objArray }) {
  return (
    <table className={styles.table}>
      <thead>
        {
          titles.map((title) => (
            <th>{title}</th>
          ))
        }
      </thead>
      <tbody>
        {objArray.map((prop) => (
          <tr>
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
