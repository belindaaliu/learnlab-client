import React, { useEffect, useState } from 'react';
import CartItem from './CartItem';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import CourseCard from '../../components/CourseCard'; 
import { getCart, removeCartItem } from '../../services/cartService.js';

// Temporary data for recommendations 
const RECOMMENDATIONS = [
  {
    id: 101,
    title: "AWS Certified Solutions Architect Associate 2026",
    instructor: "Stephane Maarek",
    rating: 4.8,
    reviews: "150,000",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop"
  },
  {
    id: 102,
    title: "Docker & Kubernetes: The Practical Guide",
    instructor: "Maximilian Schwarzmüller",
    rating: 4.9,
    reviews: "89,000",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1605745341112-85968b193ef5?q=80&w=400&auto=format&fit=crop"
  }
];

const Cart = () => {
  const token = localStorage.getItem('jwt');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const items = await getCart(token);
      setCartItems(items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (id) => {
    await removeCartItem(id, token);
    fetchCart();
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.Courses.price), 0);

  if (loading) return <div className="max-w-7xl mx-auto p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 font-sans">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start mb-20">
        {/* CART LIST */}
        <div className="lg:col-span-3">
          <p className="font-bold text-gray-800 mb-2">{cartItems.length} Courses in Cart</p>
          <div className="border-t border-gray-200">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        </div>

        {/* SIDEBAR SUMMARY */}
        <div className="lg:col-span-1 sticky top-24 border p-6 rounded-lg bg-white shadow-sm lg:border-none lg:p-0 lg:shadow-none">
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 font-bold text-lg">Total:</span>
            <span className="text-4xl font-extrabold text-gray-900">CA${total.toFixed(2)}</span>
            <Button variant="primary" className="w-full mt-6 py-4 text-lg rounded-none">
              Proceed to Checkout
            </Button>
          </div>
          <div className="mt-8">
            <p className="font-bold text-sm mb-2">Promotions</p>
            <div className="flex gap-0">
              <Input placeholder="Enter Coupon" className="rounded-r-none" />
              <Button variant="outline" className="rounded-l-none border-l-0 px-4">Apply</Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- YOU MIGHT ALSO LIKE --- */}
      <section className="border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECOMMENDATIONS.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Cart;