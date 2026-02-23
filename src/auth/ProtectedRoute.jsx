import { Navigate } from "react-router-dom";
import useAuth from "@hooks/useAuth";
import Spinner from "@components/Spinner/Spinner";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
