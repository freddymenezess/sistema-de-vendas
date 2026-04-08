import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "@components/Sidebar/Sidebar";
import styles from "./MainLayout.module.css";

const pageTitles = {
  "/painel": "Dashboard",
  "/vendas": "Vendas",
  "/funcionarios": "Equipa",
  "/stock": "Estoque",
  "/fornecedores": "Fornecedores",
  "/carrinho": "Carrinho",
};

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Mamev";

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.header}>
        <button
          className={styles.menuButton}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <div className={styles.headerRight} />
      </div>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
