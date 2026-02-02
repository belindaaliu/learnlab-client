import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CourseCard from "../../components/CourseCard";
import { getCart, removeCartItem } from "../../services/cartService.js";

const RECOMMENDATIONS = [
  /* TODO:... existing recommendations ... */
];

const Cart = () => {
  const [cartData, setCartData] = useState({
    items: [],
    total: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCartData(data || { items: [], total: 0, itemCount: 0 });
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeCartItem(id);
      fetchCart();
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const handleGoToCheckout = () => {
    if (cartData.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const flattenedItems = cartData.items.map((item) => {
      const course = item.course || item.courses || item;
      return {
        id: course.id || item.course_id || item.id,
        title: course.title || course.course_title || "Course Name Not Found",
        price: course.price || course.course_price || 0,
      };
    });

    navigate("/checkout", {
      state: {
        type: "cart",
        cartItems: flattenedItems,
        totalAmount: Number(cartData.total),
      },
    });
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-20 text-center text-xl animate-pulse">
        Loading cart...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 font-sans">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start mb-20">
        <div className="lg:col-span-3">
          <p className="font-bold text-gray-800 mb-2">
            {cartData.itemCount} Courses in Cart
          </p>
          <div className="border-t border-gray-200">
            {cartData.items.length > 0 ? (
              cartData.items.map((item) => (
                <CartItem key={item.id} item={item} onRemove={handleRemove} />
              ))
            ) : (
              <div className="py-20 text-center border-b border-gray-200">
                <p className="text-gray-500 mb-6 text-lg">
                  Your cart is empty.
                </p>
                <Button variant="outline" onClick={() => navigate("/courses")}>
                  Keep Shopping
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 sticky top-24">
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 font-bold text-lg">Total:</span>
            <span className="text-4xl font-extrabold text-gray-900">
              CA${cartData.total.toFixed(2)}
            </span>
            {cartData.total > 0 && (
              <>
                <span className="text-gray-500 line-through text-lg">
                  CA${(cartData.total * 5.5).toFixed(2)}
                </span>
                <span className="text-gray-700 text-sm">82% off</span>
              </>
            )}

            <Button
              onClick={handleGoToCheckout}
              variant="primary"
              className="w-full mt-6 py-4 text-lg rounded-none"
              disabled={cartData.items.length === 0}
            >
              Proceed to Checkout
            </Button>
          </div>

          <div className="mt-8 border-t pt-6">
            <p className="font-bold text-sm mb-2 text-gray-800">Promotions</p>
            <div className="flex gap-0">
              <Input
                placeholder="Enter Coupon"
                className="rounded-r-none border-gray-300"
              />
              <Button
                variant="outline"
                className="rounded-l-none border-l-0 px-4 h-[46px] border-gray-300 text-primary"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          You might also like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECOMMENDATIONS.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Cart;
