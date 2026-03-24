import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AuthProvider from "@auth/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import Alerts from "@components/Alerts"; // ajuste o caminho

function PageTitleSetter() {
  const location = useLocation();

  useEffect(() => {
    const pathTitles = {
      "/": "Home | MAMEV",
      "/dashboard": "Dashboard | MAMEV",
      "/estoque": "Estoque | MAMEV",
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
        <Alerts /> {/* <- renderiza aqui, apenas uma vez */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
