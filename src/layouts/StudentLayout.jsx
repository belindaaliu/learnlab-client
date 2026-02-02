import { useState, useEffect } from "react";
import axios from "axios";
import { Link, Outlet } from "react-router-dom";
import { Search, Bell, ShoppingCart, MessageSquare } from "lucide-react";
import logo from "../assets/images/logo.png";
import { useNavigate } from "react-router-dom";



export default function StudentLayout() {

  const [realUser, setRealUser] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);


  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Get logged‑in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove stored auth data
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // if you use one

    // Optional: clear axios auth header
    delete axios.defaults.headers.common["Authorization"];

    // Redirect to login page
    navigate("/login");
  };


  useEffect(() => {
    if (!userId) return;

    // Fetch user profile
    axios
      .get(`${API_URL}/student/me/${userId}`)
      .then((res) => setRealUser(res.data))
      .catch((err) => console.error("User fetch error:", err));

    // Fetch purchased courses
    axios
      .get(`${API_URL}/student/${userId}/courses`)
      .then((res) => setPurchasedCourses(res.data))
      .catch((err) => console.error("Purchased fetch error:", err));

    // Fetch wishlist courses
    axios
      .get(`${API_URL}/student/${userId}/wishlist`)
      .then((res) => setWishlistCourses(res.data))
      .catch((err) => console.error("Wishlist fetch error:", err));
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ---------------- TOP NAVBAR ---------------- */}
      <header className="bg-white h-20 border-b border-gray-200 shadow-sm flex items-center px-6 gap-6">
        
        {/* LEFT — Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/student/dashboard">
            <img src={logo} alt="LearnLab Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* CENTER — Search Bar */}
        <div className="hidden md:flex flex-1 max-w-3xl mx-6 relative">
          <input
            type="text"
            placeholder="Search your courses..."
            className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 border-transparent 
                       focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100 
                       outline-none transition text-sm"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>

        {/* RIGHT — Navigation + Icons */}
        <div className="flex items-center gap-6 shrink-0">

          {/* Plans & Pricing */}
          <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-primary transition">
            Plans & Pricing
          </Link>

          {/* Teach */}
          <Link to="/teach" className="text-sm font-medium text-gray-700 hover:text-primary transition">
            Teach on LearnLab
          </Link>

          {/* My Learning */}
          <div className="relative group pt-2">
          <Link
            to="/student/learning"
            className="text-sm font-medium text-gray-700 hover:text-primary transition"
          >
            My Learning
          </Link>

          <div
            className="absolute left-0 top-full w-80 bg-white shadow-lg border rounded-lg z-50
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      group-hover:pointer-events-auto transition"
          >
            <div className="p-4 space-y-4">
              {purchasedCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex gap-3">
                  <img
                    src={course.thumbnail_url}
                    className="w-16 h-10 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-2">{course.title}</p>
                    <Link
                      to={`/course/${course.id}`}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Start learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-3">
              <Link
                to="/student/learning"
                className="block text-center text-sm font-semibold text-primary hover:underline"
              >
                Go to My Learning
              </Link>
            </div>
          </div>
        </div>


        
          {/* Wishlist */}
          <div className="relative group pt-2">
            <Link
              to="/student/learning?tab=wishlist"
              className="text-sm font-medium text-gray-700 hover:text-primary transition"
            >
              Wishlist
            </Link>

            <div
              className="absolute left-0 top-full w-80 bg-white shadow-lg border rounded-lg z-50
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        group-hover:pointer-events-auto transition"
            >
              <div className="p-4 space-y-4">
                {wishlistCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex gap-3">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {course.title}
                      </p>
                      <Link
                        to={`/course/${course.id}`}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        View course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-3">
                <Link
                  to="/student/learning?tab=wishlist"
                  className="block text-center text-sm font-semibold text-primary hover:underline"
                >
                  Go to Wishlist
                </Link>
              </div>
            </div>
          </div>


          {/* Cart */}
          <Link to="/cart" className="relative text-gray-600 hover:text-primary transition">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] 
                            font-bold w-4 h-4 flex items-center justify-center rounded-full">
              0
            </span>
          </Link>

          {/* Notifications */}
          <Link to="/student/notifications" className="text-gray-600 hover:text-primary transition">
            <Bell className="w-6 h-6" />
          </Link>

          {/* Messages */}
          <Link to="/student/messages" className="text-gray-600 hover:text-primary transition">
            <MessageSquare className="w-6 h-6" />
          </Link>

          {/* Avatar */}
          <div className="relative group cursor-pointer pt-2">
            {realUser?.avatar_url ? (
              <img
                src={realUser.avatar_url}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center 
                              justify-center font-semibold">
                {realUser?.first_name?.[0]}
                {realUser?.last_name?.[0]}
              </div>
            )}

            {/* Dropdown */}
            <div
              className="absolute right-0 top-full w-64 bg-white shadow-xl rounded-lg z-50
                        opacity-0 group-hover:opacity-100 hover:opacity-100
                        pointer-events-none group-hover:pointer-events-auto transition"
            >
              <div className="px-4 py-3 border-b">
                <p className="font-semibold">
                  {realUser?.first_name} {realUser?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <div className="py-2">
                <Link to="/student/learning" className="block px-4 py-2 hover:bg-gray-100">
                  My learning
                </Link>
                <Link to="/cart" className="block px-4 py-2 hover:bg-gray-100">
                  My cart
                </Link>
                <Link
                  to="/student/learning?tab=wishlist"
                  className="lock px-4 py-2 hover:bg-gray-100"
                >
                  Go to Wishlist
                </Link>

                <Link to="/teach" className="block px-4 py-2 hover:bg-gray-100">
                  Teach on LearnLab
                </Link>

                <div className="border-t my-2"></div>

                <Link to="/student/notifications" className="block px-4 py-2 hover:bg-gray-100">
                  Notifications
                </Link>
                <Link to="/student/messages" className="block px-4 py-2 hover:bg-gray-100">
                  Messages
                </Link>

                <div className="border-t my-2"></div>

                <Link to="/student/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Account settings
                </Link>
                <Link to="/student/subscription" className="block px-4 py-2 hover:bg-gray-100">
                  Subscriptions
                </Link>
                <Link to="/student/payment/history" className="block px-4 py-2 hover:bg-gray-100">
                  Purchase history
                </Link>

                <div className="border-t my-2"></div>

                <Link to="/student/public-profile" className="block px-4 py-2 hover:bg-gray-100">
                  Public profile
                </Link>
                <Link to="/student/edit-profile" className="block px-4 py-2 hover:bg-gray-100">
                  Edit profile
                </Link>
                <Link to="/help" className="block px-4 py-2 hover:bg-gray-100">
                  Help & Support
                </Link>

                <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Log out
              </button>

              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ---------------- PAGE CONTENT ---------------- */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
