import { Search, PanelLeftClose, PanelLeft, Bell } from "lucide-react";
import { useState } from "react";
import { useMenu } from "@context/MenuProvider";
import DropMenu from "@components/DropMenu";
import styles from "./Header.module.css";

function Header({ className = "" }) {
  const { isOpen, toggleMenu } = useMenu();
  const [focus, setFocus] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <header className={`${styles.container} ${className}`}>
      {/* LEFT */}
      <div className={styles.left}>
        <button 
          className={styles.menuBtn} 
          onClick={toggleMenu}
          aria-label={isOpen ? "Minimizar menu" : "Expandir menu"}
        >
          {isOpen ? (
            <PanelLeftClose size={20} />
          ) : (
            <PanelLeft size={20} />
          )}
        </button>
        <div className={styles.greeting}>
          <span className={styles.greetingText}>{getGreeting()}</span>
          <span className={styles.greetingName}>Administrador</span>
        </div>
      </div>

      {/* CENTER (Search) */}
      <div className={styles.center}>
        <div className={`${styles.searchWrapper} ${focus ? styles.focus : ""}`}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Pesquisar produtos, fornecedores..."
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notificações">
          <Bell size={20} />
          <span className={styles.notificationBadge}>3</span>
        </button>
        <div className={styles.divider} />
        <div className={styles.dropWrapper}>
          <DropMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
