import { Search, Menu as MenuIcon, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";
import { useMenu } from "@context/MenuProvider";
import DropMenu from "@components/DropMenu";
import styles from "./Header.module.css";

function Header({ className = "" }) {
  const { isOpen, toggleMenu } = useMenu();
  const [focus, setFocus] = useState(false);

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
            <PanelLeftClose size={22} />
          ) : (
            <PanelLeft size={22} />
          )}
        </button>
      </div>

      {/* CENTER (Search) */}
      <div className={styles.center}>
        <div className={`${styles.searchWrapper} ${focus ? styles.focus : ""}`}>
          <Search size={18} />
          <input
            type="search"
            placeholder="Pesquisar por alguma coisa..."
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <div className={styles.dropWrapper}>
          <DropMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
