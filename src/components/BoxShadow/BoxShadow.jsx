import styles from './BoxShadow.module.css';

function BoxShadow({ children }) {
  return (
    <div className={styles.box}>
      {children}
    </div>
  )
}

export default BoxShadow;