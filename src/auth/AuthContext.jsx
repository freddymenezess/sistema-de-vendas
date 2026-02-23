import { createContext, useEffect, useState } from "react";
import { getItem, setItem } from "@services/storage.js";
import { users, products, lowProducts, salesChart } from "@data";

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
    setItem("salesChart", salesChart);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear()
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
