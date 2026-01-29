import styles from "./Menu.module.css";

function Menu({ className }) {
  return (
    <div className={`${styles.menu} ${className}`}>
      Menu
    </div>
  );
};

export default Menu;