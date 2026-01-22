import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '@auth/PrivateRoute';

import MainLayout from '@templates/MainLayout/MainLayout';
import Home from '@pages/Home/Home';
import Login from '@pages/Login/Login';
import Dashboard from '@pages/Dashboard/Dashboard';


function AppRoutes() {
  return (
    <Routes>
      <Route path="*" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;