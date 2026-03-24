import {
  Home,
  User,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMenu } from "@context/MenuProvider";
import useAuth from "@hooks/useAuth";
import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

// Rotas por role
const navItemsByRole = {
  admin: [
    { to: "/", label: "Home", icon: Home },
    { to: "/dashboard", label: "Painel Admin", icon: LayoutDashboard },
    { to: "/vendas", label: "Vendas", icon: TrendingUp },
    { to: "/estoque", label: "Estoque", icon: ShoppingCart },
    { to: "/funcionarios", label: "Equipa", icon: User },
    { to: "/fornecedores", label: "Fornecedores", icon: Users },
  ],
  manager: [
    { to: "/", label: "Home", icon: Home },
    { to: "/dashboard", label: "Painel Admin", icon: LayoutDashboard },
    { to: "/vendas", label: "Vendas", icon: TrendingUp },
    { to: "/estoque", label: "Estoque", icon: ShoppingCart },
    { to: "/funcionarios", label: "Equipa", icon: User },
    { to: "/fornecedores", label: "Fornecedores", icon: Users },
  ],
  seller: [
    { to: "/", label: "Home", icon: Home },
    { to: "/estoque", label: "Estoque", icon: ShoppingCart },
    { to: "/vendas", label: "Vendas", icon: TrendingUp },
  ],
};

function NavBar({ className = "" }) {
  const { isOpen, closeMenu } = useMenu();
  const { user } = useAuth();

  // Obtém as rotas com base no role do usuário, ou usa um array vazio se não estiver autenticado
  const navItems = user?.role ? navItemsByRole[user.role] || [] : [];

  return (
    <nav
      className={`${styles.navbar} ${!isOpen ? styles.close : ""} ${className}`}
    >
      {/* <div className={styles.logoWrapper}>
        <img src={logo_full} alt="Mamev" className={styles.logo} />

        <X size={24} className={styles.closeBtn} onClick={closeMenu} />
      </div> */}

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
