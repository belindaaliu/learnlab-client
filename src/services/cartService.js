import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getCart = async (token) => {
  const res = await axios.get(`${API_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

const addToCart = async (courseId, token) => {
  const res = await axios.post(`${API_URL}/cart`, { courseId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

const updateCartItem = async (cartItemId, quantity, token) => {
  const res = await axios.put(`${API_URL}/cart/${cartItemId}`, { quantity }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

const removeCartItem = async (cartItemId, token) => {
  const res = await axios.delete(`${API_URL}/cart/${cartItemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export { getCart, addToCart, updateCartItem, removeCartItem };
