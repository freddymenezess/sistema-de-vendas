import BoxShadow from "@components/BoxShadow/BoxShadow";
import styles from "./Card.module.css";

function Card({
  children,
  className = "",
  classContainer = "",
  icon: Icon = "",
  color = "var(--main)",
  desc,
  dest,
  onClick,
}) {
  return (
    <BoxShadow className={className}>
      <div
        className={`${styles.container} ${classContainer}`}
        onClick={onClick}
      >
        {(Icon || desc || dest) && (
          <div className={`${styles.header} flex`}>
            {Icon && Icon && (
              <Icon
                size={64}
                color={color}
                className={styles.icon}
                style={{ background: `${color}1b` }}
              />
            )}
            {desc && dest && (
              <strong className={`${styles.info} flex`}>
                <p className={styles.desc}>{desc}</p>
                <h3 className={styles.dest}>{dest}</h3>
              </strong>
            )}
          </div>
        )}
        {children}
      </div>
    </BoxShadow>
  );
}

export default Card;
