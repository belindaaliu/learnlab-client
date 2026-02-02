import api from '../utils/Api'; 

const getCart = async () => {
  const res = await api.get('/cart'); 
  return res.data.data; 
};

const removeCartItem = async (cartItemId) => {
  const res = await api.delete(`/cart/${cartItemId}`);
  return res.data;
};

export { getCart, removeCartItem };