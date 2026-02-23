import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@auth/ProtectedRoute";
import MainLayout from "@templates/MainLayout/MainLayout";
import HomeLayout from "@templates/HomeLayout/HomeLayout";
import Home from "@pages/Home/Home";
import Login from "@pages/Login/Login";
import Dashboard from "@pages/Dashboard/Dashboard";
import Equipa from "@pages/Equipa/Equipa";
import Vendas from "@pages/Vendas/Vendas";
import EstoqueManager from "@components/EstoqueManager/EstoqueManager";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Equipa />} />
        <Route path="/stock" element={<EstoqueManager />} />
        <Route path="/stock" element={<EstoqueManager />} />
        <Route path="/reports" element={<Vendas />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;