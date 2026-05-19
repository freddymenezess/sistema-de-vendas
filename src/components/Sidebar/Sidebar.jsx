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
  LucideSquareUser,
  User,
  Truck,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import { showConfirm } from "@utils/sweetAlert";
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
        { name: "Clientes", icon: UserCheck, to: "/clientes" },
        { name: "Fornecedores", icon: LucideSquareUser, to: "/fornecedores" },
        { name: "Devoluções", icon: RotateCcw, to: "/devolucoes" },
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
      section: "Gestão",
      items: [
        { name: "Clientes", icon: UserCheck, to: "/clientes" },
        { name: "Devoluções", icon: RotateCcw, to: "/devolucoes" },
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
        { name: "Minhas Vendas", icon: TrendingUp, to: "/minhas-vendas" },
      ],
    },
    {
      section: "Gestao",
      items: [
        { name: "Clientes", icon: UserCheck, to: "/clientes" },
        { name: "Devolucoes", icon: RotateCcw, to: "/devolucoes" },
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

  const handleLogout = async () => {
    const result = await showConfirm(
      "Terminar sessão?",
      "Tem certeza que deseja sair do sistema?",
      "Sim, sair",
    );
    if (result.isConfirmed) {
      logout();
      onClose();
    }
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
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
            <div className={styles.avatar}>
              <div className={styles.productImage}>
                {user.fotoUrl ? (
                  <img
                    src={user.fotoUrl}
                    alt={user.nome}
                    className={styles.productImg}
                  />
                ) : (
                  user?.nome?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.nome || "Usuario"}</div>
              <div className={styles.userRole}>{user?.cargo}</div>
            </div>
          </div>
          <div className={styles.userActions}>
            <NavLink
              to="/perfil"
              onClick={onClose}
              className={styles.profileButton}
            >
              <User size={16} />
              Perfil
            </NavLink>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
