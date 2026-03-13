import { Search, Bell, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { useMenu } from "@context/MenuProvider";
import DropMenu from "@components/DropMenu";
import useAuth from "@hooks/useAuth";
import styles from "./Header.module.css";

function Header({ className = "" }) {
  const { isOpen, openMenu } = useMenu();
  const { user } = useAuth();

  const [focus, setFocus] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const today = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className={`${styles.container} ${className}`}>
      {/* LEFT */}
      <div className={styles.left}>
        {!isOpen && <MenuIcon className={styles.menuBtn} onClick={openMenu} />}

        {!mobileSearch && (
          <div className={styles.userBlock}>
            <h4 className={styles.greeting}>Olá, {user.name.split(" ")[0]}</h4>
            <span className={styles.date}>{today}</span>
          </div>
        )}
      </div>

      {/* CENTER (Search Desktop) */}
      <div className={styles.center}>
        <div className={`${styles.searchWrapper} ${focus ? styles.focus : ""}`}>
          <Search size={18} />
          <input
            type="search"
            placeholder="Pesquisar produtos, vendas..."
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        {/* Mobile Search Toggle */}
        <div className={styles.mobileSearchBtn}>
          {mobileSearch ? (
            <X size={20} onClick={() => setMobileSearch(false)} />
          ) : (
            <Search size={20} onClick={() => setMobileSearch(true)} />
          )}
        </div>

        <div className={styles.dropWrapper}>
          <DropMenu />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearch && (
        <div className={styles.mobileSearch}>
          <Search size={18} />
          <input type="search" placeholder="Pesquisar..." autoFocus />
        </div>
      )}
    </header>
  );
}

export default Header;
