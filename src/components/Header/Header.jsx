import { Menu } from "lucide-react"
import { useMenu } from "@context/MenuProvider";
import useAuth from "@hooks/useAuth"
import styles from "./Header.module.css";

function Header() {
  const { user: USER } = useAuth();
  const { isOpen, openMenu } = useMenu();

  return (
    <header className={`${styles.container} flex`}>
      {!isOpen && <Menu className={styles.btn} onClick={openMenu} />}
      <div className={styles.box2}>
        <h1>{USER.name}</h1>
        <p className={styles.info}>
          {USER.role === "admin"
            ? "Admin Master"
            : USER.role === "manager"
              ? "Gerente de loja"
              : "Funcionário de vendas"}
        </p>
      </div>
    </header>
  );
}

export default Header;
