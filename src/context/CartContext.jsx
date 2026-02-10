import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/Api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (user) {
      // LOGGED IN: use backend cart
      try {
        const res = await api.get("/cart");
        const count = res.data?.data?.itemCount ?? res.data?.itemCount ?? 0;
        setCartCount(count);
      } catch (err) {
        console.error("Cart fetch error", err);
        setCartCount(0);
      }
    } else {
      // GUEST: use localStorage cart
      const localItems = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(localItems.length);
    }
  }, [user]);

  useEffect(() => {
    fetchCartCount();

    const handler = () => fetchCartCount();
    window.addEventListener("storage", handler);
    window.addEventListener("cartUpdate", handler);

    return () => window.removeEventListener("storage", handler);
    window.removeEventListener("cartUpdate", handler);
  }, [fetchCartCount, user]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
