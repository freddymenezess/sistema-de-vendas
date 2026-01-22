import styles from "./Statics.module.css";

function MainCard() {
  const vendasHoje = 1250000;
  
  return (
    <div className={styles.destaque}>
      <div>
        <span>Total vendido hoje</span>
        <p className={styles.price}>
          <strong>
            {vendasHoje.toLocaleString("pt-AO", {
              style: "currency",
              currency: "AOA",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </p>
      </div>
    </div>
  );
}

export default MainCard;