import styles from "./BoxShadow.module.css";

function BoxShadow({ className, children }) {
  return (
    <div className={`${styles.box} ${className}`}>
      {children}
    </div>
  );
}

export default BoxShadow;