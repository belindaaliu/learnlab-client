import { useState, useEffect } from "react";
import axios from "axios";
import CourseCard from "../../components/CourseCard";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../services/cartService";
import { toast } from "react-hot-toast";
import { Play, FileText, CheckCircle, Clock, Download, ChevronRight } from "lucide-react";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  // Get logged‑in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch profile, recommendations, and enrolled courses
  useEffect(() => {
    if (!userId) return;

    Promise.all([
      axios.get(`${API_URL}/student/me/${userId}`),
      axios.get(`${API_URL}/student/${userId}/recommendations`),
      // Get all enrolled courses (both completed and uncompleted)
      axios.get(`${API_URL}/student/${userId}/enrolled-courses-next`)
    ])
    .then(([profileRes, recommendationsRes, enrolledRes]) => {
      setProfile(profileRes.data);
      setRecommended(recommendationsRes.data);
      
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
      // Fallback if the new endpoint fails
      axios.get(`${API_URL}/student/${userId}/purchased-courses`)
        .then(res => {
          const allCourses = res.data || [];
          const uncompleted = allCourses.filter(course => {
            const progress = course.total_lessons > 0 
              ? Math.round((course.completed_lessons / course.total_lessons) * 100)
              : 0;
            return progress < 100;
          });
          setEnrolledCourses(uncompleted.slice(0, 3));
        })
        .catch(e => console.error("Fallback fetch error:", e));
    })
    .finally(() => setLoading(false));
  }, [userId]);

  // Handle search
  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToCart = async (courseId) => {
    try {
      await addToCart(courseId);
      toast.success("Course added to your cart!");
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
      toast.success("Added to wishlist!");
    } catch (err) {
      console.error("Wishlist error:", err);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        toast("This course is already in your wishlist", { icon: "ℹ️" });
      } else {
        toast.error(
          err.response?.data?.message || "Failed to add to wishlist"
        );
      }
    }
  };

  // Function to get content type icon
  const getContentIcon = (contentType) => {
    switch (contentType?.toLowerCase()) {
      case "lecture":
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "article":
      case "note":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "quiz":
      case "assessment":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case "download":
        return <Download className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
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
      case "download": return "Download";
      default: return "Content";
    }
  };

  // Function to format time left
  const formatTimeLeft = (minutes) => {
    if (!minutes || minutes <= 0) return "";
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
  };

  // Handle continue learning
  const handleContinueLearning = (courseId, nextContentId, e) => {
    if (e) e.stopPropagation();
    
    if (nextContentId) {
      // Navigate to course player with the specific lesson as query parameter
      navigate(`/course/${courseId}/learn?lesson=${nextContentId}`);
    } else {
      // No next lesson found, go to course overview
      navigate(`/course/${courseId}/learn`);
    }
  };

  return (
    <div className="pb-20 max-w-7xl mx-auto px-4">
      {/* WELCOME */}
      <div className="mt-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name}
        </h1>
        <p className="text-gray-600 mt-1 flex items-center gap-3">
          {profile?.occupation || "Learner"}
          <Link
            to="/student/edit-profile"
            className="text-primary font-semibold hover:underline"
          >
            Edit occupation & interests
          </Link>
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="mt-8 max-w-2xl relative">
        <input
          type="text"
          placeholder="Search for courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full pl-4 pr-12 py-3 rounded-full bg-gray-100 border border-gray-300
                     focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100
                     outline-none transition text-sm"
        />
        <button
          onClick={handleSearchClick}
          disabled={!searchQuery.trim()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* MY LEARNING SECTION - HORIZONTAL LAYOUT */}
      {enrolledCourses.length > 0 ? (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Let's start learning
            </h2>
            <Link 
              to="/student/my-courses" 
              className="text-primary font-semibold hover:underline text-sm flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">My learning</h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const isInProgress = course.progress > 0 && course.progress < 100;
                  
                  return (
                    <div 
                      key={course.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col h-full"
                      onClick={() => navigate(`/course/${course.id}/learn`)}
                    >
                      {/* Course Header */}
                      <div className="mb-4">
                        <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 h-12">
                          {course.title}
                        </h4>
                        
                        {/* Progress bar and stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{course.completedContent || 0}/{course.totalContent || 0} completed</span>
                            <span className="font-semibold">{course.progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Next content item */}
                      {course.nextContent ? (
                        <div className="mt-auto">
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Next up:</p>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getContentIcon(course.nextContent.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {course.nextContent.order}. {course.nextContent.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <span className="capitalize">
                                    {getContentTypeLabel(course.nextContent.type)}
                                  </span>
                                  {course.nextContent.duration && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTimeLeft(course.nextContent.duration)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            className="w-full mt-4 bg-primary text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                            onClick={(e) => handleContinueLearning(course.id, course.nextContent?.id, e)}
                          >
                            {isInProgress ? 'Continue Learning' : 'Start Course'}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Get started:</p>
                            <p className="text-sm text-gray-700">
                              Begin your learning journey
                            </p>
                          </div>
                          <button 
                            className="w-full bg-primary text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                            onClick={(e) => handleContinueLearning(course.id, null, e)}
                          >
                            Start Course
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : !loading && completedCourses.length > 0 ? (
        // If user has only completed courses
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">All courses completed! 🎉</h3>
            <p className="text-gray-600 mb-4">
              You've completed {completedCourses.length} course{completedCourses.length !== 1 ? 's' : ''}. 
              Time to explore something new!
            </p>
            <Link 
              to="/courses"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      ) : !loading ? (
        // If user has no enrolled courses at all
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Start your learning journey</h3>
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
            <Link 
              to="/courses"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      ) : null}

      {/* RECOMMENDATIONS */}
      {recommended.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">
            What to learn next
          </h2>
          <p className="text-gray-500 mb-6">Recommended for you</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommended.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onAddToCart={() => handleAddToCart(course.id)}
                onAddToWishlist={() => handleAddToWishlist(course.id)}
                isPremiumCourse={!!course.plan_id || !!course.SubscriptionPlans}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}