import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; 

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

  // syncAuth Logic 
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser((prev) => {
            const isDifferent = JSON.stringify(prev) !== JSON.stringify(parsedUser);
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

 // Cart Merge Logic 
useEffect(() => {
  const mergeCartOnLogin = async () => {
    const token = localStorage.getItem("accessToken");
    const guestCart = JSON.parse(localStorage.getItem("cart")) || [];

    // ONLY merge if there is a guest cart and a user
    if (user && user.role === 'student' && guestCart.length > 0 && token) {
      try {
        console.log("Merging guest cart...");
        await Promise.all(
          guestCart.map((item) =>
            axios.post(
              `${import.meta.env.VITE_API_URL}/cart`,
              { courseId: item.id },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );
        localStorage.removeItem("cart");
      } catch (err) {
        console.error("Cart merge failed:", err);
      }
    }
  };

  mergeCartOnLogin();
}, [user]); 

  //  Checkout Recovery Logic 
  useEffect(() => {
    const pendingData = localStorage.getItem("pending_checkout");
    if (user && pendingData) {
      sessionStorage.setItem("checkout_recovery", pendingData);
      localStorage.removeItem("pending_checkout");
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