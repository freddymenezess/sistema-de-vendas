import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@auth/ProtectedRoute";
import MainLayout from "@templates/MainLayout/MainLayout";
import HomeLayout from "@templates/HomeLayout/HomeLayout";
import Home from "@pages/Home/Home";
import Login from "@pages/Login/Login";
import NonAuthorized from "@pages/NonAuthorized/NonAuthorized";
import Dashboard from "@pages/Dashboard/Dashboard";
import Funcionarios from "@/pages/Funcionarios/Funcionarios";
import Vendas from "@pages/Vendas/Vendas";
import Estoque from "@pages/Estoque/Estoque";
import Fornecedores from "@pages/Fornecedores/Fornecedores";
import Caixas from "@pages/Caixas/Caixas";
import Relatorios from "@pages/Relatorios/Relatorios";

function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/nao-autorizado" element={<NonAuthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <HomeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/carrinho" element={<Home />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/stock" element={<Estoque />} />
        <Route path="/stock-consulta" element={<Estoque readOnly={true} />} />
        <Route path="/vendas" element={<Vendas />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/caixas" element={<Caixas />} />
        <Route path="/meu-caixa" element={<Caixas isVendedorView={true} />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
