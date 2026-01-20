import { createContext, useState } from "react";
import { getItem, setItem, removeItem } from "@services/storage.js";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getItem("currentUser"));

  const login = (userData) => {
    setItem("currentUser", userData);
    setUser(userData);
  };

  const logout = () => {
    removeItem("currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;