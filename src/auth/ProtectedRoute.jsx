import { Navigate } from "react-router-dom";
import useAuth from "@hooks/useAuth";
import Loading from "@components/Loading/Loading";

function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;
  
  if (requiredRoles && !requiredRoles.includes(user.cargo)) {
    return <Navigate to="/nao-authorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
