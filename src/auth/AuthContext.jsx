import { createContext, useEffect, useState } from "react";
import { getItem, setItem, removeItem } from "../services/storage";
import { users, products, lowProducts } from "../data";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getItem("currentUser");
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = (userData) => {
    setItem("currentUser", userData);
    setItem("users", users);
    setItem("products", products);
    setItem("lowProducts", lowProducts);
    setUser(userData);
  };

  const logout = () => {
    removeItem("currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
