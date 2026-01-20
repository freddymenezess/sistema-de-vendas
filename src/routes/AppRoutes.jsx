import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '@auth/PrivateRoute';

import Home from '@pages/Home/Home';
import Login from '@pages/Login/Login';
import Dashboard from '@pages/Dashboard/Dashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path='*' element={<Login />} />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>}
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>}
      />
    </Routes>
  );
}

export default AppRoutes;