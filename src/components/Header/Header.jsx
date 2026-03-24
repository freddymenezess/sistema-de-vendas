import { Search, Menu as MenuIcon } from "lucide-react";
import { useState } from "react";
import { useMenu } from "@context/MenuProvider";
import DropMenu from "@components/DropMenu";
import styles from "./Header.module.css";
import logo_full from "/mamev-f.png";

function Header({ className = "" }) {
  const { isOpen, openMenu } = useMenu();
  const [focus, setFocus] = useState(false);

  return (
    <header className={`${styles.container} ${className}`}>
      {/* LEFT */}
      <div className={styles.left}>
        {!isOpen && <MenuIcon className={styles.menuBtn} onClick={openMenu} />}
        <img src={logo_full} alt="Mamev" className={styles.logo} />
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
