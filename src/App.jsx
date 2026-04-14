import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MenuProvider } from "@context/MenuProvider";
import AuthProvider from "@auth/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import Alerts from "@components/Alerts"; 
import { pathTitles } from "@data/path-titles";

function PageTitleSetter() {
  const location = useLocation();

  useEffect(() => {
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
