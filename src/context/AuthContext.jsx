import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import api from "../utils/Api";

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
  const [userPlan, setUserPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  // --- Global Subscription Fetcher ---
  const fetchUserPlan = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user) {
      setUserPlan(null);
      return;
    }

    try {
      setPlanLoading(true);
      const res = await api.get("/subscription/overview");
      const planInfo = res.data?.data || res.data;
      setUserPlan(planInfo);
    } catch (err) {
      console.error("Global subscription fetch failed:", err);
      setUserPlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, [user]);

  // Fetch plan whenever user changes
  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  // --- Sync Auth Logic ---
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

  // --- Cart Merge Logic ---
  useEffect(() => {
    const mergeCartOnLogin = async () => {
      const token = localStorage.getItem("accessToken");
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];

      if (user && user.role === "student" && guestCart.length > 0 && token) {
        try {
          await Promise.all(
            guestCart.map((item) =>
              axios.post(
                `${import.meta.env.VITE_API_URL}/cart`,
                { courseId: item.id },
                { headers: { Authorization: `Bearer ${token}` } },
              ),
            ),
          );
          localStorage.removeItem("cart");
        } catch (err) {
          console.error("Cart merge failed:", err);
        }
      }
    };
    mergeCartOnLogin();
  }, [user]);

  // --- Checkout Recovery ---
  useEffect(() => {
    const pendingData = localStorage.getItem("pending_checkout");
    if (user && pendingData) {
      sessionStorage.setItem("checkout_recovery", pendingData);
      localStorage.removeItem("pending_checkout");
      window.location.href = "/checkout";
    }
  }, [user]);

  // --- Logout ---
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setUserPlan(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        userPlan,
        planLoading,
        fetchUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
