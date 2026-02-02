import { Routes, Route } from "react-router-dom";
import PrivateRoute from "@auth/PrivateRoute";
import MainLayout from "@templates/MainLayout/MainLayout";
import HomeLayout from "@templates/HomeLayout/HomeLayout";
import Home from "@pages/Home/Home";
import Login from "@pages/Login/Login";
import Dashboard from "@pages/Dashboard/Dashboard";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <HomeLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<Home />} />
        <Route path="/" element={<Home />} />
      </Route>

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;