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
import Perfil from "@pages/Perfil/Perfil";
import Encomendas from "@pages/Encomendas/Encomendas";
import Clientes from "@pages/Clientes/Clientes";
import Devolucoes from "@pages/Devolucoes/Devolucoes";

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
        <Route path="/meu-caixa" element={<Caixas isVendedorView={true} />} />
        <Route path="/minhas-vendas" element={<Vendas isVendedorView={true} />} />
        <Route path="/stock-consulta" element={<Estoque readOnly={true} />} />
        <Route path="/devolucoes" element={<Devolucoes />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      <Route
        element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/encomendas" element={<Encomendas />} />
      </Route>

      <Route
        element={
          <ProtectedRoute requiredRoles={["admin", "manager"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/stock" element={<Estoque />} />
        <Route path="/caixas" element={<Caixas />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
