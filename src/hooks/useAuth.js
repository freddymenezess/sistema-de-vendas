import { useContext } from "react";
import { AuthContext } from "@auth/AuthContext";

function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;