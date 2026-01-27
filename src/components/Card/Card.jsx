import BoxShadow from "@components/BoxShadow/BoxShadow";
import styles from "./Card.module.css";

function Card({
  children,
  className,
  icon: Icon,
  color = "#D4A373",
  desc,
  dest,
}) {
  return (
    <BoxShadow className={className}>
      <div className={styles.container}>
        <div className={`${styles.header} flex`}>
          <Icon
            size={64}
            color={color}
            className={styles.icon}
            style={{ background: `${color}1b` }}
          />
          <strong className={`${styles.info} flex`}>
            <p className={styles.desc}>{desc}</p>
            <h3 className={styles.dest}>{dest}</h3>
          </strong>
        </div>
        {children}
      </div>
    </BoxShadow>
  );
}

export default Card;