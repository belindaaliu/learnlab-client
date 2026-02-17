import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
} from "lucide-react";
import CourseCard from "../../components/CourseCard";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../utils/Api";
import { addToCart } from "../../services/cartService";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const CATEGORIES = ["All", "Development", "Business", "Design"];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating_desc" },
];

const CoursesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { fetchCartCount } = useCart();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "All";
  const currentPriceParam = searchParams.get("price");
  const currentPriceRange = currentPriceParam ? currentPriceParam.split(",") : [];
  const currentSort = searchParams.get("sort") || "newest";

  const updateURLParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null || 
        value === "" || 
        (Array.isArray(value) && value.length === 0) || 
        (key === 'category' && value === 'All') || 
        (key === 'sort' && value === 'newest')
      ) {
        newParams.delete(key);
      } else {
        newParams.set(key, Array.isArray(value) ? value.join(",") : value);
      }
    });
    
    setSearchParams(newParams, { replace: true });
  };

  // Fetch enrolled courses once when user changes
  useEffect(() => {
    if (!user) {
      setEnrolledCourseIds([]);
      return;
    }

    const fetchEnrolled = async () => {
      try {
        const res = await api.get(`/student/${user.id}/courses`);
        const data = res.data?.data || res.data || [];
        const ids = data.map((c) => Number(c.id));
        setEnrolledCourseIds(ids);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
      }
    };

    fetchEnrolled();
  }, [user]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const response = await api.get(`/student/${user.id}/wishlist`);
          const ids = response.data.map(item => item.course_id || item.Course?.id || item.id);
          setWishlistIds(ids);
        } catch (err) {
          console.error("Failed to fetch wishlist:", err);
        }
      }
    };
    
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = {};
        if (currentSearch) params.search = currentSearch;
        if (currentCategory !== "All") params.category = currentCategory;
        if (currentSort !== "newest") params.sort = currentSort;

        const response = await api.get("/courses", { params });
        const data = response.data.data || response.data;

        let result = data;
        
        if (currentPriceRange.length > 0) {
          result = result.filter((c) => {
            const price = Number(c.price);
            if (currentPriceRange.includes("free") && price === 0) return true;
            if (currentPriceRange.includes("under_20") && price > 0 && price <= 20) return true;
            if (currentPriceRange.includes("mid") && price > 20 && price <= 100) return true;
            if (currentPriceRange.includes("high") && price > 100) return true;
            return false;
          });
        }

        setCourses(result);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.response?.data?.message || "Could not load courses.");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCourses, 500);
    return () => clearTimeout(timeoutId);
  }, [currentSearch, currentCategory, currentPriceRange.join(","), currentSort]);

  const handlePriceChange = (value) => {
    const updated = currentPriceRange.includes(value)
      ? currentPriceRange.filter((item) => item !== value)
      : [...currentPriceRange, value];
    updateURLParams({ price: updated });
  };

  const handleSortChange = (value) => {
    updateURLParams({ sort: value });
    setShowSortMenu(false);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleAddToCart = async (course) => {
    try {
      const courseIdNum = Number(course.id);

      if (user) {
        if (enrolledCourseIds.includes(courseIdNum)) {
          toast("You already own this course.", { icon: "ℹ️" });
          return;
        }

        await addToCart(course.id);
        toast.success("Course added to your cart!");
      } else {
        const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
        const isAlreadyInCart = guestCart.some(
          (item) => String(item.id) === String(course.id),
        );

        if (!isAlreadyInCart) {
          guestCart.push({
            id: course.id,
            title: course.title,
            price: course.price,
            thumbnail: course.thumbnail_url || course.image,
            instructor_id: course.Users?.id,
            instructor_name: course.Users
              ? `${course.Users.first_name} ${course.Users.last_name}`
              : "Instructor",
          });
          localStorage.setItem("cart", JSON.stringify(guestCart));
          toast.success("Course added to your cart!");
        } else {
          toast("This course is already in your cart.", { icon: "ℹ️" });
        }
      }

      await fetchCartCount();
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error(err.response?.data?.message || "Failed to add course to cart.");
    }
  };

  const handleAddToWishlist = async (courseId) => {
    try {
      if (!user) {
        toast.error("Please login to add courses to your wishlist");
        return;
      }

      await api.post(`/student/${user.id}/wishlist`, { course_id: courseId });
      setWishlistIds(prev => [...prev, courseId]);
      toast.success("Added to wishlist!");
    } catch (err) {
      console.error("Wishlist error:", err);
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        toast("This course is already in your wishlist", { icon: "ℹ️" });
      } else {
        toast.error(err.response?.data?.message || "Failed to add to wishlist");
      }
    }
  };

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      if (!user) return;

      await api.delete(`/student/${user.id}/wishlist/${courseId}`);
      setWishlistIds(prev => prev.filter(id => id !== courseId));
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      toast.error("Failed to remove from wishlist");
    }
  };

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || "Sort";

  return (
    <div
      className="bg-gray-50 min-h-screen py-8"
      onClick={() => setShowSortMenu(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
            <p className="text-gray-500 mt-1">Found {courses.length} results</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search (e.g. React)..."
                icon={Search}
                value={currentSearch}
                onChange={(e) => updateURLParams({ search: e.target.value })}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {currentSortLabel}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                        currentSort === opt.value
                          ? "text-primary font-bold bg-purple-50"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center justify-center">
            {error}
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR FILTERS */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" /> Categories
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateURLParams({ category: cat })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentCategory === cat
                        ? "bg-primary text-white font-medium shadow-md shadow-purple-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Price</h3>
              <div className="space-y-3">
                {[
                  { label: "Free", value: "free" },
                  { label: "Under $20", value: "under_20" },
                  { label: "$20 - $100", value: "mid" },
                  { label: "$100+", value: "high" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={currentPriceRange.includes(item.value)}
                      onChange={() => handlePriceChange(item.value)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RESULTS GRID */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onAddToCart={() => handleAddToCart(course)}
                    onAddToWishlist={() => handleAddToWishlist(course.id)}
                    onRemoveFromWishlist={() => handleRemoveFromWishlist(course.id)}
                    isInWishlist={wishlistIds.includes(course.id)}
                    isPremiumCourse={
                      !!course.plan_id || !!course.SubscriptionPlans
                    }
                    isOwned={
                      user && enrolledCourseIds.includes(Number(course.id))
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No courses found
                </h3>
                <p className="text-gray-500">Try adjusting your filters.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesList;