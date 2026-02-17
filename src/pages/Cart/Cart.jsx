import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CourseCard from "../../components/CourseCard";
import { useAuth } from "../../context/AuthContext";
import {
  getCart,
  removeCartItem,
  addToCart,
} from "../../services/cartService.js";
import { useCart } from "../../context/CartContext";
import api from "../../utils/Api";
import { toast } from "react-hot-toast";

const Cart = () => {
  const { user } = useAuth();
  const { fetchCartCount } = useCart();
  const [cartData, setCartData] = useState({
    items: [],
    total: 0,
    subtotal: 0,
    discount_total: 0,
    subscription_discount_total: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      if (user && user.id) {
        // LOGGED IN: Get from API
        const data = await getCart();
        setCartData({
          items: data.items || [],
          total: data.total ?? 0,
          subtotal: data.subtotal ?? data.total ?? 0,
          discount_total: data.discount_total ?? 0,
          subscription_discount_total: data.subscription_discount_total ?? 0,
          itemCount: data.itemCount ?? 0,
        });
      } else {
        // GUEST: Get from LocalStorage and enrich with course data
        const localCart = localStorage.getItem("cart");
        const localItems = localCart ? JSON.parse(localCart) : [];

        // Fetch full course details for each item to get ratings
        const enrichedItems = await Promise.all(
          localItems.map(async (item) => {
            try {
              // Fetch full course details
              const response = await api.get(`/courses/${item.id}`);
              const courseData = response.data?.data || response.data;

              return {
                id: item.id,
                course: {
                  id: item.id,
                  title: courseData.title || item.title,
                  price: courseData.price || item.price,
                  image:
                    courseData.thumbnail_url ||
                    courseData.image ||
                    item.thumbnail ||
                    item.image,
                  instructor_name:
                    courseData.instructor_name || item.instructor_name,
                  Users: courseData.Users || item.Users,
                  rating: courseData.rating || 0,
                  reviews: courseData.reviews || 0,
                  total_reviews:
                    courseData.total_reviews || courseData.reviews || 0,
                },
              };
            } catch (err) {
              console.error(`Error fetching course ${item.id}:`, err);
              // Fallback to local data if fetch fails
              return {
                id: item.id,
                course: {
                  id: item.id,
                  title: item.title,
                  price: item.price,
                  image: item.thumbnail || item.image || item.thumbnail_url,
                  instructor_name: item.instructor_name,
                  Users: item.Users,
                  rating: item.rating || 0,
                  reviews: item.reviews || 0,
                  total_reviews: item.total_reviews || item.reviews || 0,
                },
              };
            }
          }),
        );

        const total = enrichedItems.reduce(
          (sum, item) => sum + Number(item.course.price || 0),
          0,
        );

        setCartData({
          items: enrichedItems,
          total: total,
          subtotal: total,
          discount_total: 0,
          itemCount: enrichedItems.length,
        });
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user || !user.id) {
      setRecommendations([]);
      return;
    }
    try {
      setRecsLoading(true);
      const res = await api.get(`/student/${user.id}/recommendations`);
      const data = res.data?.data || res.data || [];
      setRecommendations(data);
    } catch (err) {
      console.error("Recommendations fetch error:", err);
      setRecommendations([]);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchRecommendations();
    window.addEventListener("storage", fetchCart);

    return () => window.removeEventListener("storage", fetchCart);
  }, [user]);

  useEffect(() => {
    console.log("cartData:", cartData);
  }, [cartData]);

  const handleMoveToWishlist = async (courseId) => {
    try {
      if (!user) {
        toast.error("Please log in to save courses");
        return;
      }

      await api.post(`/student/${user.id}/wishlist`, { courseId });

      if (user) {
        // find matching cart item ID
        const cartItem = cartData.items.find(
          (i) =>
            Number(i.course_id || i.course?.id || i.id) === Number(courseId),
        );
        if (cartItem) {
          await removeCartItem(cartItem.id);
        }
      } else {
        const localItems = JSON.parse(localStorage.getItem("cart")) || [];
        const filtered = localItems.filter(
          (item) => Number(item.id) !== Number(courseId),
        );
        localStorage.setItem("cart", JSON.stringify(filtered));
      }

      await fetchCart();
      await fetchCartCount();

      toast.success("Moved to wishlist");
    } catch (err) {
      console.error("Move to wishlist failed:", err);
      toast.error("Could not move to wishlist");
    }
  };

  const handleRemove = async (id) => {
    try {
      if (user) {
        await removeCartItem(id);
      } else {
        const localItems = JSON.parse(localStorage.getItem("cart")) || [];
        const filtered = localItems.filter((item) => item.id !== id);
        localStorage.setItem("cart", JSON.stringify(filtered));
      }
      await fetchCart();
      await fetchCartCount();
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

  const handleAddRecommendationToCart = async (course) => {
    try {
      if (user && user.id) {
        // LOGGED IN: call your existing cart service
        await addToCart(course.id);
      } else {
        // GUEST: add to localStorage cart with all relevant data
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

        const exists = localCart.some((item) => item.id === course.id);
        if (!exists) {
          localCart.push({
            id: course.id,
            title: course.title,
            price: course.price,
            thumbnail_url: course.thumbnail_url,
            image: course.image,
            instructor_name:
              course.instructor ||
              course.instructor_name ||
              (course.Users
                ? `${course.Users.first_name} ${course.Users.last_name}`
                : "Unknown Instructor"),
            Users: course.Users,
            rating: course.rating || 0,
            reviews: course.reviews || course.total_reviews || 0,
            total_reviews: course.total_reviews || course.reviews || 0,
          });
          localStorage.setItem("cart", JSON.stringify(localCart));
        }
      }

      await fetchCart();
      await fetchCartCount();
    } catch (err) {
      console.error("Add recommendation to cart error:", err);
    }
  };

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
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onMoveToWishlist={handleMoveToWishlist}
                />
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

            {/* Original subtotal if anything was discounted */}
            {cartData.subtotal > cartData.total && (
              <span className="text-gray-500 line-through text-lg">
                CA${cartData.subtotal.toFixed(2)}
              </span>
            )}

            {/* Course-level discounts (sales, coupons on courses) */}
            {cartData.discount_total > 0 && (
              <div className="flex justify-between text-sm text-gray-700">
                <span>Course discounts</span>
                <span>-CA${cartData.discount_total.toFixed(2)}</span>
              </div>
            )}

            {/* NEW: subscription extra discount */}
            {cartData.subscription_discount_total > 0 && (
              <div className="flex justify-between text-sm text-emerald-700">
                <span>Subscription savings</span>
                <span>
                  -CA${cartData.subscription_discount_total.toFixed(2)}
                </span>
              </div>
            )}

            {/* Optional combined % off */}
            {cartData.subtotal > cartData.total && (
              <span className="text-gray-700 text-sm mt-1">
                {Math.round(
                  ((cartData.discount_total +
                    cartData.subscription_discount_total) /
                    cartData.subtotal) *
                    100,
                )}
                % off
              </span>
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
        </div>
      </div>

      <section className="border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          You might also like
        </h2>

        {recsLoading ? (
          <p className="text-gray-500 text-sm">Loading recommendations...</p>
        ) : !recommendations || recommendations.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No recommendations yet. Browse courses to get personalized
            suggestions.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isPremiumCourse={!!course.plan_id || !!course.SubscriptionPlans}
                onAddToCart={() => handleAddRecommendationToCart(course)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Cart;
