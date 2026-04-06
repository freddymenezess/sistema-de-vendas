import {
  Home,
  User,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Users,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import Logout from "@mui/icons-material/Logout";
import { useMenu } from "@context/MenuProvider";
import useAuth from "@hooks/useAuth";
import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";
import logoFull from "/mamev-f.png";

const navItemsByRole = {
  admin: [
    { to: "/painel", label: "Painel Admin", icon: LayoutDashboard },
    { to: "/vendas", label: "Vendas", icon: TrendingUp },
    { to: "/stock", label: "Stock", icon: ShoppingCart },
    { to: "/funcionarios", label: "Equipa", icon: User },
    { to: "/fornecedores", label: "Fornecedores", icon: Users },
  ],
  manager: [
    { to: "/carrinho", label: "Carrinho", icon: Home },
    { to: "/painel", label: "Painel Admin", icon: LayoutDashboard },
    { to: "/vendas", label: "Vendas", icon: TrendingUp },
    { to: "/stock", label: "Estoque", icon: ShoppingCart },
    { to: "/funcionarios", label: "Equipa", icon: User },
    { to: "/fornecedores", label: "Fornecedores", icon: Users },
  ],
  seller: [
    { to: "/carrinho", label: "Carrinho", icon: Home },
    { to: "/stock", label: "Estoque", icon: ShoppingCart },
    { to: "/vendas", label: "Vendas", icon: TrendingUp },
  ],
};

function NavBar({ className = "" }) {
  const { isOpen, toggleMenu } = useMenu();
  const { user, logout } = useAuth();

  // Obtém as rotas com base no role do usuário, ou usa um array vazio se não estiver autenticado
  const navItems = user?.role ? navItemsByRole[user.role] || [] : [];

  return (
    <nav
      className={`${styles.navbar} ${!isOpen ? styles.collapsed : ""} ${className}`}
    >
      <div className={styles.logoWrapper}>
        {isOpen ? (
          <>
            <img src={logoFull} alt="Mamev" className={styles.logo} />
            <button
              className={styles.menuBtn}
              onClick={toggleMenu}
              aria-label={isOpen ? "Minimizar menu" : "Expandir menu"}
            >
              {isOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
          </>
        ) : (
          <button className={styles.menu} onClick={toggleMenu}>
            <Menu size={20} strokeWidth={1.8}  />
          </button>
        )}
      </div>

      <div className={styles.box2}>
        <div className={styles.navList}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={styles.navlink}>
              {({ isActive }) => (
                <div
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  title={!isOpen ? label : undefined}
                >
                  <Icon size={20} strokeWidth={1.8} />
                  {isOpen && <span>{label}</span>}
                  {isActive && <div className={styles.activeIndicator} />}
                </div>
              )}
            </NavLink>
          ))}
        </div>
        <button
          type="button"
          className={`${styles.navItem} ${styles.logout}`}
          onClick={() => logout()}
        >
          <Logout fontSize="small" />
          {isOpen && "Terminar Sessão"}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
