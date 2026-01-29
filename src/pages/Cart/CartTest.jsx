// src/pages/Cart/CartTest.jsx
import React, { useState } from 'react';
import CartItem from './CartItem';
// Adjusted paths: moving up two levels from src/pages/Cart/ to reach src/
import CourseCard from '../../components/CourseCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const DUMMY_CART = [
  {
    id: 1,
    Courses: {
      id: 101,
      title: "Amazon Web Services (AWS) Certified - 5 Certifications!",
      instructor: "BackSpace Academy and 1 other",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 2,
    Courses: {
      id: 102,
      title: "Ultimate AWS Certified Developer Associate 2026 DVA-C02",
      instructor: "Stephane Maarek",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    },
  },
];

const RECOMMENDATIONS = [
  {
    id: 3,
    title: "100 Days of Code: The Complete Python Pro Bootcamp",
    instructor: "Dr. Angela Yu",
    rating: 4.7,
    reviews: 410499,
    price: 18.99,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
  }
];

const CartTest = () => {
  const [cartItems, setCartItems] = useState(DUMMY_CART);

  const handleRemove = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.Courses.price), 0);
  const originalTotal = subtotal * 7.3; // Matches the ~86% discount look in the image

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start mb-20">
        
        {/* --- LEFT COLUMN: ITEM LIST --- */}
        <div className="lg:col-span-3">
          <p className="font-bold text-gray-800 mb-2">{cartItems.length} Courses in Cart</p>
          <div className="border-t border-gray-200">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onRemove={handleRemove} 
                />
              ))
            ) : (
              <div className="py-20 text-center border-b border-gray-200">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <Button variant="primary">Keep Shopping</Button>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: STICKY CHECKOUT SIDEBAR --- */}
        <div className="lg:col-span-1 sticky top-28">
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 font-bold text-md">Subtotal:</span>
            <span className="text-3xl font-extrabold text-gray-900">CA${subtotal.toFixed(2)}</span>
            {subtotal > 0 && (
              <>
                <span className="text-gray-500 line-through text-sm">CA${originalTotal.toFixed(2)}</span>
                <span className="text-gray-700 text-sm">86% off</span>
              </>
            )}
          </div>

          <Button 
            variant="primary" 
            className="w-full mt-6 py-3.5 text-md font-bold rounded-none bg-[#A435F0] hover:bg-[#8710D8] border-none"
          >
            Proceed to Checkout
          </Button>

          <div className="mt-8 border-t pt-6">
            <div className="flex">
              <input 
                type="text"
                placeholder="Enter Coupon" 
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 transition-colors" 
              />
              <button 
                className="bg-white border border-l-0 border-gray-300 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Apply
              </button>
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

export default CartTest;