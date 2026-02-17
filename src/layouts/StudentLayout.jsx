import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { 
  Bell, 
  ShoppingCart, 
  MessageSquare,
  ChevronDown,
  BookOpen,
  Heart,
  Award,
  CreditCard,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  CheckCircle
} from "lucide-react";
import logo from "../assets/images/logo.png";
import NotificationDropdown from "../components/NotificationDropdown";

export default function StudentLayout() {
  const [realUser, setRealUser] = useState(null);
  const { cartCount } = useCart();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [userRes, purchasedRes, wishlistRes] = await Promise.all([
          axios.get(`${API_URL}/student/me/${userId}`),
          axios.get(`${API_URL}/student/${userId}/courses`),
          axios.get(`${API_URL}/student/${userId}/wishlist`)
        ]);
        
        setRealUser(userRes.data);
        setPurchasedCourses(purchasedRes.data || []);
        setWishlistCourses(wishlistRes.data || []);

        // Fetch progress for each purchased course
        if (purchasedRes.data && purchasedRes.data.length > 0) {
          const progressPromises = purchasedRes.data.map(course => 
            axios.get(`${API_URL}/course-player/${course.id}/progress`, config)
              .then(res => ({ courseId: course.id, progress: res.data }))
              .catch(err => {
                console.error(`Error fetching progress for course ${course.id}:`, err);
                return { courseId: course.id, progress: { completed_lessons: 0, total_lessons: 0 } };
              })
          );

          const progressResults = await Promise.all(progressPromises);
          const progressMap = {};
          progressResults.forEach(result => {
            progressMap[result.courseId] = result.progress;
          });
          setCourseProgress(progressMap);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [userId]);

  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getInitials = () => {
    if (!realUser) return "U";
    return `${realUser.first_name?.[0] || ''}${realUser.last_name?.[0] || ''}`.toUpperCase();
  };

  const calculateProgress = (course) => {
    const progress = courseProgress[course.id];
    if (!progress) return 0;
    return Math.round((progress.completed_lessons / progress.total_lessons) * 100) || 0;
  };

  const getCourseStatus = (course) => {
    const progress = calculateProgress(course);
    if (progress === 0) return { text: "Start learning", color: "text-primary" };
    if (progress === 100) return { text: "Completed", color: "text-green-600" };
    return { text: "Continue learning", color: "text-primary" };
  };

  // Filter out completed courses (progress === 100)
  const inProgressCourses = purchasedCourses.filter(course => {
    const progress = calculateProgress(course);
    return progress < 100;
  });

  return (
    <>
      {/* ---------------- TOP NAVBAR ---------------- */}
      <header className="bg-white h-20 border-b border-gray-200 shadow-sm flex items-center px-6 justify-between">
        {/* LEFT — Logo */}
        <div className="flex items-center gap-4">
          <Link to="/student/dashboard">
            <img
              src={logo}
              alt="LearnLab Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* RIGHT — Navigation + Icons */}
        <div className="flex items-center gap-6">
          {/* Plans & Pricing */}
          <Link
            to="/pricing"
            className="text-sm font-medium text-gray-700 hover:text-primary transition"
          >
            Plans & Pricing
          </Link>

          {/* Teach on LearnLab */}
          <Link
            to="/teach"
            className="text-sm font-medium text-gray-700 hover:text-primary transition"
          >
            Teach on LearnLab
          </Link>

          {/* My Learning dropdown */}
          <div className="relative">
            <button
              onClick={(e) => toggleDropdown(e, 'learning')}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary transition"
            >
              <span>My Learning</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'learning' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'learning' && (
              <div className="absolute left-0 top-full mt-2 w-96 bg-white shadow-lg border rounded-lg z-50">
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {inProgressCourses.length > 0 ? (
                    inProgressCourses.slice(0, 5).map((course) => {
                      const progress = calculateProgress(course);
                      const status = getCourseStatus(course);
                      
                      return (
                        <Link
                          key={course.id}
                          to={`/course/${course.id}/learn`}
                          className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-20 h-14 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-primary">
                              {course.title}
                            </p>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  progress === 100 ? 'bg-green-500' : 'bg-primary'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${status.color}`}>
                                {status.text}
                              </span>
                              <span className="text-xs text-gray-500">
                                {progress}%
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">All caught up!</p>
                      <p className="text-xs text-gray-500 mt-1">You've completed all your courses</p>
                      <Link
                        to="/courses"
                        className="inline-block mt-4 text-xs text-primary hover:underline font-medium"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Browse more courses
                      </Link>
                    </div>
                  )}
                </div>
                {purchasedCourses.length > 0 && (
                  <div className="border-t p-3 bg-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2 px-1">
                      <span>Total courses: {purchasedCourses.length}</span>
                      <span>Completed: {purchasedCourses.length - inProgressCourses.length}</span>
                    </div>
                    <Link
                      to="/student/learning"
                      className="block text-center text-sm font-semibold text-primary hover:underline"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Go to My Learning
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist dropdown */}
          <div className="relative">
            <button
              onClick={(e) => toggleDropdown(e, 'wishlist')}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary transition"
            >
              <span>Wishlist</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'wishlist' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'wishlist' && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white shadow-lg border rounded-lg z-50">
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {wishlistCourses.length > 0 ? (
                    wishlistCourses.slice(0, 3).map((course) => (
                      <Link
                        key={course.id}
                        to={`/courses/${course.id}`}
                        className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {course.instructor || 'Instructor'}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Your wishlist is empty</p>
                    </div>
                  )}
                </div>
                {wishlistCourses.length > 0 && (
                  <div className="border-t p-3">
                    <Link
                      to="/student/learning?tab=wishlist"
                      className="block text-center text-sm font-semibold text-primary hover:underline"
                      onClick={() => setActiveDropdown(null)}
                    >
                      View all ({wishlistCourses.length}) items
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/student/cart"
            className="relative text-gray-600 hover:text-primary transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {Number(cartCount) > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Messages */}
          <Link
            to="/student/messages"
            className="text-gray-600 hover:text-primary transition"
          >
            <MessageSquare className="w-6 h-6" />
          </Link>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={(e) => toggleDropdown(e, 'profile')}
              className="flex items-center gap-2 focus:outline-none"
            >
              {realUser?.photo_url ? (
                <img
                  src={realUser.photo_url}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-primary transition"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white flex items-center justify-center font-semibold">
                  {getInitials()}
                </div>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'profile' && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-lg border z-50">
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold">
                    {realUser?.first_name} {realUser?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="py-2">
                  <Link
                    to="/student/learning"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    My learning
                  </Link>
                  <Link
                    to="/student/certificates"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Award className="w-4 h-4 text-gray-500" />
                    Certificates
                  </Link>
                  <Link
                    to="/student/cart"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    My cart
                    {cartCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/student/learning?tab=wishlist"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Heart className="w-4 h-4 text-gray-500" />
                    Wishlist
                  </Link>
                  
                  <div className="border-t my-2"></div>
                  
                  <Link
                    to="/student/notifications"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Bell className="w-4 h-4 text-gray-500" />
                    Notifications
                  </Link>
                  <Link
                    to="/student/messages"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    Messages
                  </Link>
                  
                  <div className="border-t my-2"></div>
                  
                  <Link
                    to="/student/subscription"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Sparkles className="w-4 h-4 text-gray-500" />
                    Subscriptions
                  </Link>
                  <Link
                    to="/student/payment/history"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    Purchase history
                  </Link>
                  
                  <div className="border-t my-2"></div>
                  
                  <Link
                    to={`/${user?.role}/public-profile/${user?.id}`}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    Public profile
                  </Link>
                  <Link
                    to="/student/edit-profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    Edit profile
                  </Link>
                  
                  <div className="border-t my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- PAGE CONTENT ---------------- */}
      <main className="flex-1 p-8">
        <Outlet context={{ searchResults: [] }} />
      </main>
    </>
  );
}