import React, { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");
      return savedUser && token ? JSON.parse(savedUser) : null;
    } catch (err) {
      console.error("Auth hydration error:", err);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser((prev) => {
            const isDifferent =
              JSON.stringify(prev) !== JSON.stringify(parsedUser);
            return isDifferent ? parsedUser : prev;
          });
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    const interval = setInterval(syncAuth, 500);

    return () => {
      window.removeEventListener("storage", syncAuth);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const pendingData = localStorage.getItem("pending_checkout");

    if (user && pendingData) {
      // Move data to sessionStorage so Checkout can find it without state
      sessionStorage.setItem("checkout_recovery", pendingData);
      localStorage.removeItem("pending_checkout");

      // Use a hard redirect to bypass the Login.jsx redirect
      window.location.href = "/checkout";
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
