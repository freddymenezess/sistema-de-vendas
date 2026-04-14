import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Heart,
  LogOut,
  CreditCard,
  BarChart3,
  LucideSquareUser
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import styles from "./Sidebar.module.css";

const menuItems = {
  admin: [
    {
      section: "Principal",
      items: [
        { name: "Painel do Admin", icon: LayoutDashboard, to: "/painel" },
        { name: "Vendas", icon: TrendingUp, to: "/vendas" },
      ],
    },
    {
      section: "Gestão",
      items: [
        { name: "Funcionários", icon: Users, to: "/funcionarios" },
        { name: "Estoque", icon: Package, to: "/stock" },
        { name: "Caixas", icon: CreditCard, to: "/caixas" },
        { name: "Fornecedores", icon: LucideSquareUser, to: "/fornecedores" },
      ],
    },
    {
      section: "Análises",
      items: [{ name: "Relatórios", icon: BarChart3, to: "/relatorios" }],
    },
  ],
  manager: [
    {
      section: "Principal",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, to: "/painel" },
        { name: "Vendas", icon: TrendingUp, to: "/vendas" },
      ],
    },
    {
      section: "Operações",
      items: [
        { name: "Estoque", icon: Package, to: "/stock" },
        { name: "Caixas", icon: CreditCard, to: "/caixas" },
        { name: "Relatórios", icon: BarChart3, to: "/relatorios" },
      ],
    },
  ],
  seller: [
    {
      section: "Principal",
      items: [
        { name: "PDV", icon: ShoppingCart, to: "/carrinho" },
        { name: "Meu Caixa", icon: CreditCard, to: "/meu-caixa" },
      ],
    },
    {
      section: "Consultas",
      items: [{ name: "Estoque", icon: Package, to: "/stock-consulta" }],
    },
  ],
};

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const cargo = user?.cargo || "seller";
  const menu = menuItems[cargo] || menuItems.seller;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <Heart size={20} />
          </div>
          <span className={styles.brandName}>Mamev Cosmeticos</span>
        </div>

        <nav className={styles.nav}>
          {menu.map((section, idx) => (
            <div key={idx} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                  }
                >
                  <item.icon size={20} />
                  {item.name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitials(user?.nome)}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.nome || "Usuario"}</div>
              <div className={styles.userRole}>{user?.cargo || cargo}</div>
            </div>
          </div>
          <button className={styles.logoutButton} onClick={logout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
