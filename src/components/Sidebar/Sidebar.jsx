import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  FileText,
  Heart,
  LogOut,
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import { getItem } from "@services/storage";
import styles from "./Sidebar.module.css";

const menuItems = {
  admin: [
    {
      section: "Principal",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, to: "/painel" },
        { name: "Vendas", icon: TrendingUp, to: "/vendas" },
      ],
    },
    {
      section: "Gestao",
      items: [
        { name: "Equipa", icon: Users, to: "/funcionarios" },
        { name: "Estoque", icon: Package, to: "/stock" },
        { name: "Fornecedores", icon: FileText, to: "/fornecedores" },
      ],
    },
  ],
  manager: [
    {
      section: "Principal",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, to: "/painel" },
        { name: "Carrinho", icon: ShoppingCart, to: "/carrinho" },
      ],
    },
    {
      section: "Gestao",
      items: [
        { name: "Vendas", icon: TrendingUp, to: "/vendas" },
        { name: "Estoque", icon: Package, to: "/stock" },
        { name: "Equipa", icon: Users, to: "/funcionarios" },
        { name: "Fornecedores", icon: FileText, to: "/fornecedores" },
      ],
    },
  ],
  seller: [
    {
      section: "Principal",
      items: [
        { name: "Carrinho", icon: ShoppingCart, to: "/carrinho" },
        { name: "Estoque", icon: Package, to: "/stock" },
      ],
    },
    {
      section: "Consultas",
      items: [{ name: "Vendas", icon: TrendingUp, to: "/vendas" }],
    },
  ],
};

function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const user = getItem("currentUser");
  const role = user?.role || "seller";
  const menu = menuItems[role] || menuItems.seller;

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
              <div className={styles.userRole}>{role}</div>
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
