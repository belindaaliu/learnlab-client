import api from "../utils/Api";

const getCart = async () => {
  const res = await api.get("/cart");
  return res.data?.data || res.data;
};

const removeCartItem = async (cartItemId) => {
  const res = await api.delete(`/cart/${cartItemId}`);
  return res.data;
};

// Only for logged-in users
const addToCart = async (courseId) => {
  const response = await api.post("/cart", { courseId });
  return response.data;
};

export { getCart, removeCartItem, addToCart };
