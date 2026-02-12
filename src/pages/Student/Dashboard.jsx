import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CourseCard from "../../components/CourseCard";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../services/cartService";
import { toast } from "react-hot-toast";
import { 
  Play, 
  FileText, 
  CheckCircle, 
  Clock, 
  Download, 
  ChevronRight,
  ChevronLeft,
  BookOpen,
  TrendingUp,
  Sparkles,
  Search,
  Award,
  ArrowRight,
  UserCircle,
  Zap,
  Flame,
  Star,
  BarChart
} from "lucide-react";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  
  // Featured courses state
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("popular");
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(0);
  const featuredCoursesPerPage = 4;
  const featuredRef = useRef(null);
  
  // Recommendations state with pagination
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedCurrentPage, setRecommendedCurrentPage] = useState(0);
  const recommendedPerPage = 4; // Changed from 3 to 4 to match featured
  const recommendedRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  // Get logged‑in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch profile, recommendations, and enrolled courses
  useEffect(() => {
    if (!userId) return;

    Promise.all([
      axios.get(`${API_URL}/student/me/${userId}`),
      axios.get(`${API_URL}/student/${userId}/recommendations`),
      axios.get(`${API_URL}/student/${userId}/enrolled-courses-next`)
    ])
    .then(([profileRes, recommendationsRes, enrolledRes]) => {
      setProfile(profileRes.data);
      setRecommended(recommendationsRes.data || []);
      
      const allCourses = enrolledRes.data || [];
      
      // Separate completed and uncompleted courses
      const uncompleted = allCourses.filter(course => course.progress < 100);
      const completed = allCourses.filter(course => course.progress === 100);
      
      // Show only last 3 uncompleted courses
      setEnrolledCourses(uncompleted.slice(0, 3));
      setCompletedCourses(completed);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
    })
    .finally(() => setLoading(false));
  }, [userId]);

  // Fetch featured courses when tab changes
  useEffect(() => {
    if (!userId) return;
    
    const fetchFeaturedCourses = async () => {
      setFeaturedLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/student/${userId}/featured-courses?tab=${activeTab}`
        );
        setFeaturedCourses(response.data.courses || []);
        setFeaturedCurrentPage(0);
      } catch (error) {
        console.error("Error fetching featured courses:", error);
        
        // Check if it's a 404 - feature not available
        if (error.response?.status === 404) {
          console.log("Featured courses feature not available on this server");
          // Set empty array to hide the section
          setFeaturedCourses([]);
          // Don't show error toast - silently fail
        } else {
          toast.error("Failed to load featured courses");
          setFeaturedCourses([]);
        }
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, [userId, activeTab]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToCart = async (courseId) => {
    try {
      await addToCart(courseId);
      toast.success("✨ Course added to cart!");
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

      await axios.post(`${API_URL}/student/${userId}/wishlist`, { course_id: courseId }, config);
      toast.success("❤️ Added to wishlist!");
    } catch (err) {
      console.error("Wishlist error:", err);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        toast("✨ This course is already in your wishlist", { icon: "📚" });
      } else {
        toast.error(err.response?.data?.message || "Failed to add to wishlist");
      }
    }
  };

  // Navigation handlers for featured carousel
  const handleFeaturedPrevPage = () => {
    if (featuredCurrentPage > 0) {
      setFeaturedCurrentPage(featuredCurrentPage - 1);
      featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleFeaturedNextPage = () => {
    if (featuredCurrentPage < Math.ceil(featuredCourses.length / featuredCoursesPerPage) - 1) {
      setFeaturedCurrentPage(featuredCurrentPage + 1);
      featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Navigation handlers for recommendations carousel
  const handleRecommendedPrevPage = () => {
    if (recommendedCurrentPage > 0) {
      setRecommendedCurrentPage(recommendedCurrentPage - 1);
      recommendedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleRecommendedNextPage = () => {
    if (recommendedCurrentPage < Math.ceil(recommended.length / recommendedPerPage) - 1) {
      setRecommendedCurrentPage(recommendedCurrentPage + 1);
      recommendedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Get current courses for featured pagination
  const getCurrentFeaturedCourses = () => {
    const startIndex = featuredCurrentPage * featuredCoursesPerPage;
    return featuredCourses.slice(startIndex, startIndex + featuredCoursesPerPage);
  };

  // Get current courses for recommendations pagination
  const getCurrentRecommendedCourses = () => {
    const startIndex = recommendedCurrentPage * recommendedPerPage;
    return recommended.slice(startIndex, startIndex + recommendedPerPage);
  };

  // Function to get content type icon and color
  const getContentIcon = (contentType) => {
    switch (contentType?.toLowerCase()) {
      case "lecture":
      case "video":
        return { icon: Play, color: "text-blue-500", bg: "bg-blue-50" };
      case "article":
      case "note":
        return { icon: FileText, color: "text-green-500", bg: "bg-green-50" };
      case "quiz":
      case "assessment":
        return { icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-50" };
      case "download":
        return { icon: Download, color: "text-orange-500", bg: "bg-orange-50" };
      default:
        return { icon: FileText, color: "text-gray-500", bg: "bg-gray-50" };
    }
  };

  // Function to format content type label
  const getContentTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "lecture": return "Lecture";
      case "video": return "Video";
      case "article": return "Article";
      case "note": return "Note";
      case "quiz": return "Quiz";
      case "assessment": return "Assessment";
      case "download": return "Resource";
      default: return "Content";
    }
  };

  // Handle continue learning
  const handleContinueLearning = (courseId, nextContentId, e) => {
    e.stopPropagation();
    if (nextContentId) {
      navigate(`/course/${courseId}/learn?lesson=${nextContentId}`);
    } else {
      navigate(`/course/${courseId}/learn`);
    }
  };

  // Tab configuration
  const tabs = [
    { 
      id: "popular", 
      label: "Most Popular", 
      icon: Flame,
      description: "Top-rated courses loved by thousands of learners"
    },
    { 
      id: "new", 
      label: "New & Trending", 
      icon: Sparkles,
      description: "Fresh content added in the last 30 days"
    },
    { 
      id: "intermediate-advanced", 
      label: "Intermediate & Advanced", 
      icon: BarChart,
      description: "Take your skills to the next level"
    }
  ];

  // Add global style for hover card z-index
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .group:hover .lg\\:group-hover\\:block {
        z-index: 9999 !important;
        position: absolute !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION - Welcome & Stats */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-purple-50 to-pink-50 p-8 mt-8 border border-primary/20 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary/80 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Welcome back</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {greeting}, {profile?.first_name || "Learner"}!
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                {profile?.occupation 
                  ? `${profile.occupation} · Ready to continue your learning journey?`
                  : "Ready to continue your learning journey?"}
              </p>
              
            {/* Quick actions */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                <BookOpen className="w-5 h-5" />
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* Check if profile is incomplete - missing occupation, skills, OR interests */}
              {(!profile?.occupation || 
                !profile?.skills || 
                (Array.isArray(profile.skills) && profile.skills.length === 0) ||
                !profile?.interests || 
                (Array.isArray(profile.interests) && profile.interests.length === 0)) && (
                <Link
                  to="/student/edit-profile"
                  className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200 hover:border-primary/30 group"
                >
                  <UserCircle className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                  Complete Profile
                </Link>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="mt-8 max-w-2xl">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for courses, topics, or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-xl bg-white border border-gray-200
                       focus:border-primary focus:ring-2 focus:ring-primary/20
                       outline-none transition text-sm placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg
                       hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>
        </form>

        {/* MY LEARNING SECTION - COMPACT WITH THUMBNAILS */}
        {enrolledCourses.length > 0 ? (
          <section className="mt-10">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Continue Learning</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pick up where you left off
                </h2>
                <p className="text-sm text-gray-600">
                  You're making great progress!
                </p>
              </div>
              
              <Link 
                to="/student/learning" 
                className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all group"
              >
                View all
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => {
                const isInProgress = course.progress > 0 && course.progress < 100;
                const contentIcon = course.nextContent ? getContentIcon(course.nextContent.type) : null;
                const Icon = contentIcon?.icon || Play;
                const iconColor = contentIcon?.color || "text-primary";
                const iconBg = contentIcon?.bg || "bg-primary/10";
                
                return (
                  <div 
                    key={course.id}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer overflow-hidden flex"
                    onClick={() => navigate(`/course/${course.id}/learn`)}
                  >
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100">
                      {course.thumbnail_url ? (
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-600/10">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-gray-900 text-xs line-clamp-2 flex-1 pr-1">
                          {course.title}
                        </h3>
                        <span className="text-[10px] font-medium text-primary whitespace-nowrap">
                          {course.completedContent || 0}/{course.totalContent || 0}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      {course.nextContent ? (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className={`p-0.5 rounded ${iconBg}`}>
                            <Icon className={`w-2.5 h-2.5 ${iconColor}`} />
                          </div>
                          <p className="text-[10px] text-gray-600 truncate flex-1">
                            {course.nextContent.title}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-500 mb-2">
                          Ready to start
                        </p>
                      )}
                      
                      <button 
                        className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white text-[10px] font-medium py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-0.5"
                        onClick={(e) => handleContinueLearning(course.id, course.nextContent?.id, e)}
                      >
                        {isInProgress ? 'Continue' : 'Start'}
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 text-center sm:hidden">
              <Link 
                to="/student/my-courses" 
                className="inline-flex items-center gap-1 text-sm text-primary font-medium"
              >
                View all courses
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        ) : !loading && completedCourses.length > 0 ? (
          <section className="mt-16">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200 p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Award className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  All courses completed! 🎉
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  You've successfully completed {completedCourses.length} course{completedCourses.length !== 1 ? 's' : ''}. 
                  That's an amazing achievement! Ready for your next challenge?
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    to="/courses"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                  >
                    Browse More Courses
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/student/certificates"
                    className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    View Certificates
                    <Award className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : !loading ? (
          <section className="mt-16">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-primary/60" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Start your learning journey
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  You haven't enrolled in any courses yet. Explore our catalog and find the perfect course for you!
                </p>
                <Link 
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* RECOMMENDATIONS SECTION - With Carousel */}
        {recommended.length > 0 && (
          <section ref={recommendedRef} className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Personalized</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  What to learn next
                </h2>
                <p className="text-gray-600 mt-1">
                  Based on your interests and learning history
                </p>
              </div>
              
              <Link 
                to="/courses" 
                className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group"
              >
                View all courses
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {recommendedLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getCurrentRecommendedCourses().map((course, index) => (
                  <div key={course.id}>
                    <CourseCard
                      course={course}
                      onAddToCart={() => handleAddToCart(course.id)}
                      onAddToWishlist={() => handleAddToWishlist(course.id)}
                      isPremiumCourse={!!course.SubscriptionPlans}
                    />
                  </div>
                ))}
              </div>

                {recommended.length > recommendedPerPage && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={handleRecommendedPrevPage}
                      disabled={recommendedCurrentPage === 0}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-200
                        ${recommendedCurrentPage === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
                        }
                      `}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.ceil(recommended.length / recommendedPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setRecommendedCurrentPage(index)}
                          className={`
                            w-2 h-2 rounded-full transition-all duration-200
                            ${recommendedCurrentPage === index 
                              ? 'w-6 bg-primary' 
                              : 'bg-gray-300 hover:bg-gray-400'
                            }
                          `}
                          aria-label={`Go to page ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleRecommendedNextPage}
                      disabled={recommendedCurrentPage >= Math.ceil(recommended.length / recommendedPerPage) - 1}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-200
                        ${recommendedCurrentPage >= Math.ceil(recommended.length / recommendedPerPage) - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
                        }
                      `}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
            
            <div className="mt-6 text-center sm:hidden">
              <Link 
                to="/courses" 
                className="inline-flex items-center gap-2 text-primary font-semibold"
              >
                View all courses
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* FEATURED COURSES SECTION - Simple, just like CoursesList */}
        <section ref={featuredRef} className="mt-20">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Discover top courses
            </h2>
            <p className="text-gray-600 mt-1">
              Hand-picked selections for every skill level
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/25' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>

          {featuredLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
          ) : featuredCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getCurrentFeaturedCourses().map((course, index) => (
                  <div key={course.id}>
                    <CourseCard
                      course={course}
                      onAddToCart={() => handleAddToCart(course.id)}
                      onAddToWishlist={() => handleAddToWishlist(course.id)}
                      isPremiumCourse={!!course.SubscriptionPlans}
                    />
                  </div>
                ))}
              </div>

              {featuredCourses.length > featuredCoursesPerPage && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handleFeaturedPrevPage}
                    disabled={featuredCurrentPage === 0}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${featuredCurrentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
                      }
                    `}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(featuredCourses.length / featuredCoursesPerPage) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setFeaturedCurrentPage(index)}
                        className={`
                          w-2 h-2 rounded-full transition-all duration-200
                          ${featuredCurrentPage === index 
                            ? 'w-6 bg-primary' 
                            : 'bg-gray-300 hover:bg-gray-400'
                          }
                        `}
                        aria-label={`Go to page ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleFeaturedNextPage}
                    disabled={featuredCurrentPage >= Math.ceil(featuredCourses.length / featuredCoursesPerPage) - 1}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${featuredCurrentPage >= Math.ceil(featuredCourses.length / featuredCoursesPerPage) - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
                      }
                    `}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                Check back later for new courses in this category.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}