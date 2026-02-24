import {
  Home,
  User,
  LayoutDashboard,
  ClipboardPlus,
  ShoppingCart,
  X,
} from "lucide-react";
import { useMenu } from "@context/MenuProvider";
import { NavLink } from "react-router-dom";
import logo_full from "/mamev-full.png";
import styles from "./NavBar.module.css";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "Relatórios", icon: ClipboardPlus },
  { to: "/stock", label: "Estoque", icon: ShoppingCart },
  { to: "/employees", label: "Equipa", icon: User },
];

function NavBar({ className = "" }) {
  const { isOpen, closeMenu } = useMenu();

  return (
    <nav
      className={`${styles.navbar} ${!isOpen ? styles.close : ""} ${className}`}
    >
      <div className={styles.logoWrapper}>
        <img src={logo_full} alt="Mamev" className={styles.logo} />

        <X size={24} className={styles.closeBtn} onClick={closeMenu} />
      </div>

      <div className={styles.navList}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={styles.navlink}>
            {({ isActive }) => (
              <div
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{label}</span>

                {isActive && <div className={styles.activeIndicator} />}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
