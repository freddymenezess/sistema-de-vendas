import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MenuProvider } from "@context/MenuProvider";
import AuthProvider from "@auth/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import Alerts from "@components/Alerts"; 

function PageTitleSetter() {
  const location = useLocation();

  useEffect(() => {
    const pathTitles = {
      "/": "Home | MAMEV",
      "/dashboard": "Dashboard | MAMEV",
      "/stock": "Stock | MAMEV",
      "/vendas": "Vendas | MAMEV",
      "/funcionarios": "Equipa | MAMEV",
      "/relatorios": "Relatórios | MAMEV",
      "/login": "Login | MAMEV",
    };

    const title = pathTitles[location.pathname] || "MAMEV Cosméticos";
    document.title = title;
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageTitleSetter />
        <Alerts />
        <MenuProvider>
          <AppRoutes />
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
