// import api from '../utils/Api'; 

// const triggerCartUpdate = () => {
//   window.dispatchEvent(new Event("cartUpdate")); 
//   window.dispatchEvent(new Event("storage"));   
// };

// const getCart = async () => {
//   const res = await api.get('/cart'); 
//   return res.data.data; 
// };

// const removeCartItem = async (cartItemId) => {
//   const res = await api.delete(`/cart/${cartItemId}`);
//   return res.data;
// };

// // const addToCart = async (courseOrId) => {
// //   const token = localStorage.getItem("accessToken");
  
// //   if (token) {
// //     const courseId = typeof courseOrId === 'object' ? courseOrId.id : courseOrId;
// //     const response = await api.post("/cart", { courseId });
// //     return response.data;
// //   } else {
// //     if (typeof courseOrId !== 'object') {
// //       console.error("Guest add to cart requires full course object");
// //       return;
// //     }

// //     const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
// //     const exists = guestCart.find(item => String(item.id) === String(courseOrId.id));
    
// //     if (!exists) {
// //       guestCart.push({
// //         id: courseOrId.id,
// //         title: courseOrId.title,
// //         price: courseOrId.price,
// //         thumbnail: courseOrId.image || courseOrId.thumbnail_url
// //       });
// //       localStorage.setItem("cart", JSON.stringify(guestCart));
// //       window.dispatchEvent(new Event("storage"));
// //     }
// //     return { success: true };
// //   }
// // };

// const addToCart = async (courseOrId) => {
//   const token = localStorage.getItem("accessToken");
  
//   if (token) {
//     const courseId = typeof courseOrId === 'object' ? courseOrId.id : courseOrId;
//     const response = await api.post("/cart", { courseId });
//     return response.data;
//   } else {
    
//     const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
//     // Standardize the object structure HERE
//     const newItem = {
//       id: course.id,
//       title: course.title,
//       price: course.price,
//       image: course.image || course.thumbnail_url || course.thumbnail,
//       instructor_name: course.Users ? `${course.Users.first_name} ${course.Users.last_name}` : "Expert"
//     };
//     // ... push and save ...
//     triggerCartUpdate();
//     return { success: true };
//   }
// };


// // One single export for everything
// export { getCart, removeCartItem, addToCart };


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
