import {
  Home,
  User,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Users,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { useMenu } from "@context/MenuProvider";
import useAuth from "@hooks/useAuth";
import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";
import logoFull from "/mamev-f.png";
import logoIcon from "/mamev-icon.png";

const navItemsByRole = {
  admin: [
    { to: "/painel", label: "Dashboard", icon: LayoutDashboard },
    { to: "/vendas", label: "Vendas", icon: TrendingUp },
    { to: "/stock", label: "Stock", icon: ShoppingCart },
    { to: "/funcionarios", label: "Equipa", icon: User },
    { to: "/fornecedores", label: "Fornecedores", icon: Users },
  ],
  manager: [
    { to: "/carrinho", label: "Carrinho", icon: Home },
    { to: "/painel", label: "Dashboard", icon: LayoutDashboard },
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

  const navItems = user?.role ? navItemsByRole[user.role] || [] : [];

  return (
    <nav
      className={`${styles.navbar} ${!isOpen ? styles.collapsed : ""} ${className}`}
    >
      {/* Logo Area */}
      <div className={styles.logoArea}>
        {isOpen ? (
          <img src={logoFull} alt="Mamev" className={styles.logoFull} />
        ) : (
          <img src={logoIcon} alt="Mamev" className={styles.logoIcon} />
        )}
      </div>

      {/* Toggle Button */}
      <button
        className={styles.toggleBtn}
        onClick={toggleMenu}
        aria-label={isOpen ? "Minimizar menu" : "Expandir menu"}
      >
        {isOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
      </button>

      {/* Navigation Items */}
      <div className={styles.navContent}>
        <div className={styles.navSection}>
          {isOpen && <span className={styles.sectionLabel}>Menu</span>}
          <div className={styles.navList}>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={styles.navlink}>
                {({ isActive }) => (
                  <div
                    className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                    title={!isOpen ? label : undefined}
                  >
                    <div className={styles.iconWrapper}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    {isOpen && <span className={styles.navLabel}>{label}</span>}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className={styles.userSection}>
          {isOpen && user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>
                  {user.role === "admin"
                    ? "Administrador"
                    : user.role === "manager"
                      ? "Gerente"
                      : "Caixa"}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => logout()}
            title={!isOpen ? "Terminar Sessao" : undefined}
          >
            <LogOut size={20} strokeWidth={1.8} />
            {isOpen && <span>Terminar Sessao</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
