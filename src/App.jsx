import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MenuProvider } from "@context/MenuProvider";
import AuthProvider from "@auth/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import { pathTitles } from "@data/path-titles";
import "@utils/sweetAlert.css";

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
        <MenuProvider>
          <AppRoutes />
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
