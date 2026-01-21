import styles from './Header.module.css';

function Header({ className }) {
  return (
    <header className={`${styles.header} ${className} flex`}>
      MAMEV Dashboard
    </header>
  );
}

export default Header;
