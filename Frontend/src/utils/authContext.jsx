// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { getAuthData, saveAuthData, clearAuthData } from "./auth.utils.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const stored = getAuthData();
    if (stored) setAuth(stored); // load from localStorage on page refresh
  }, []);

  const login = (data) => {
    saveAuthData(data); // localStorage ✅
    setAuth(data);      // context state ✅

    // ✅ Notify socketContext to reconnect with the new token
    // Same-tab storage events don't fire natively — dispatch manually
    window.dispatchEvent(new StorageEvent("storage", { key: "auth" }));
  };

  const logout = () => {
    clearAuthData();   // localStorage ✅
    setAuth(null);     // context state ✅

    // ✅ Notify socketContext to disconnect
    window.dispatchEvent(new StorageEvent("storage", { key: "auth" }));
  };

  const isAuthenticated = !!auth?.user;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
