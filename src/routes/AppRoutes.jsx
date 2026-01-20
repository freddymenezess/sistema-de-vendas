import { Routes, Route } from 'react-router-dom';
import Login from '@pages/Login/Login';
import Dashboard from '@pages/Dashboard/Dashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default AppRoutes;