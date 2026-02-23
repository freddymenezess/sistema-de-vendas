import {
  Home,
  User,
  LayoutDashboard,
  ClipboardPlus,
  UserRoundPlus,
  ShoppingCart,
  X
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
      <div className={`${styles.logoWrapper} flex`}>
        <img
          src={logo_full}
          alt="Mamev"
          className={styles.logoDesktop}
        />
        <X size={28} color="#6b7280" className={styles.btn} onClick={closeMenu} />
      </div>

      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} title={label} className={styles.navlink}>
          {({ isActive }) => (
            <div
              className={`${styles.navItem} ${isActive ? styles.active : ""} flex`}
            >
              <Icon
                size={24}
                color={isActive ? "#D4A373" : "#6b7280"}
                fill={isActive ? "#D4A373" : "none"}
              />
              <span className={styles.label}>{label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default NavBar;
