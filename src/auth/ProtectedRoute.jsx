import { Navigate } from "react-router-dom";
import useAuth from "@hooks/useAuth";
import Spinner from "@components/Spinner/Spinner";

function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;
  
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/non-authorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
