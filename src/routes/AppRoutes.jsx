import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@auth/ProtectedRoute";
import MainLayout from "@templates/MainLayout/MainLayout";
import HomeLayout from "@templates/HomeLayout/HomeLayout";
import Home from "@pages/Home/Home";
import Login from "@pages/Login/Login";
import NonAuthorized from "@pages/NonAuthorized/NonAuthorized";
import Dashboard from "@pages/Dashboard/Dashboard";
import Equipa from "@pages/Equipa/Equipa";
import Vendas from "@pages/Vendas/Vendas";
import Estoque from "@pages/Estoque/Estoque";
import Fornecedores from "@pages/Fornecedores/Fornecedores";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/non-authorized" element={<NonAuthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <HomeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="*" element={<Home />} />
        <Route path="/" element={<Home />} />
      </Route>

      <Route
        element={
          <ProtectedRoute requiredRoles={["admin", "manager"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/funcionarios" element={<Equipa />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/relatorios" element={<Vendas />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
