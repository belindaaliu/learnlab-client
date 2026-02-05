import api from '../utils/Api'; 

const getCart = async () => {
  const res = await api.get('/cart'); 
  return res.data.data; 
};

const removeCartItem = async (cartItemId) => {
  const res = await api.delete(`/cart/${cartItemId}`);
  return res.data;
};

const addToCart = async (courseId) => {
  const res = await api.post('/cart', { courseId });
  return res.data;
};

export { getCart, removeCartItem, addToCart };