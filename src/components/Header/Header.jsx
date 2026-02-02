import { Search } from "lucide-react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useMenu } from "@context/MenuProvider";
import DropMenu from "@components/DropMenu";
import styles from "./Header.module.css";

function Header() {
  const [focus, setFocus] = useState(false);
  const { isOpen, openMenu } = useMenu();

  return (
    <header className={`${styles.container} flex`}>
      {!isOpen && <Menu className={styles.btn} onClick={openMenu} />}
      <form className={`${styles.form} flex`}>
        <label>
          <input
            type="search"
            placeholder="O que procura?"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </label>
        <button
          type="button"
          className={`${styles.btnSearch} ${focus ? styles.btnFocus : ""}`}
        >
          <Search />
        </button>
      </form>
      <DropMenu />
    </header>
  );
}

export default Header;
