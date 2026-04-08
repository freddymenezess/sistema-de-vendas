import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@services/firebase";
import { signOut } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { setItem } from "@services/storage.js";
import { users, products, lowProducts } from "@data";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setItem("currentUser", userData);
    setItem("users", users);
    setItem("products", products);
    setItem("lowProducts", lowProducts);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
