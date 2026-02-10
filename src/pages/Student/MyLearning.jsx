import { useState, useEffect } from "react";
import axios from "axios";
import { Search, X, PlayCircle, CheckCircle, BookOpen, Clock } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import CourseCard from "../../components/CourseCard";

export default function MyLearning() {
  const [activeTab, setActiveTab] = useState("courses");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState({ courses: true, wishlist: true });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  useEffect(() => {
    if (tabFromUrl === "wishlist") {
      setActiveTab("wishlist");
    } else {
      setActiveTab("courses");
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (!userId) return;

    // Fetch purchased courses with progress
    setLoading(prev => ({ ...prev, courses: true }));
    axios
      .get(`${API_URL}/student/${userId}/courses`, config)
      .then((res) => {
        setPurchasedCourses(res.data);
        setLoading(prev => ({ ...prev, courses: false }));
      })
      .catch((err) => {
        console.error("Error fetching purchased:", err);
        setLoading(prev => ({ ...prev, courses: false }));
      });

    // Fetch wishlist courses
    setLoading(prev => ({ ...prev, wishlist: true }));
    axios
      .get(`${API_URL}/student/${userId}/wishlist`, config)
      .then((res) => {
        setWishlistCourses(res.data);
        setLoading(prev => ({ ...prev, wishlist: false }));
      })
      .catch((err) => {
        console.error("Error fetching wishlist:", err);
        setLoading(prev => ({ ...prev, wishlist: false }));
      });
  }, [userId]);

  const handleRemoveFromWishlist = async (courseId) => {
    if (!userId) return;

    try {
      await axios.delete(`${API_URL}/student/${userId}/wishlist/${courseId}`, config);
      // Refresh wishlist by filtering out the removed course
      setWishlistCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("Failed to remove from wishlist");
    }
  };

  const coursesToShow = activeTab === "courses" ? purchasedCourses : wishlistCourses;

  const filteredCourses = coursesToShow.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProgressPercent = (course) => {
    if (!course.total_lessons || course.total_lessons === 0) return 0;
    return Math.round((course.completed_lessons / course.total_lessons) * 100);
  };

  const getProgressStatus = (percent) => {
    if (percent === 0) return "Not started";
    if (percent === 100) return "Completed";
    if (percent >= 50) return "In progress";
    return "Started";
  };

  const getProgressColor = (percent) => {
    if (percent === 100) return "bg-green-500";
    if (percent >= 50) return "bg-blue-500";
    if (percent > 0) return "bg-purple-600";
    return "bg-gray-300";
  };

  const getProgressTextColor = (percent) => {
    if (percent === 100) return "text-green-600";
    if (percent >= 50) return "text-blue-600";
    if (percent > 0) return "text-purple-600";
    return "text-gray-500";
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Add this function to your MyLearning component
const getFirstIncompleteLesson = async (courseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/course-player/${courseId}/first-incomplete`,
      config
    );
    return response.data.lessonId;
  } catch (error) {
    console.error("Error getting first incomplete lesson:", error);
    return null;
  }
};

// Update the "Continue Learning" button/link:
const handleContinueLearning = async (courseId, e) => {
  e.preventDefault();
  
  try {
    // Get the next (first incomplete) lesson
    const response = await axios.get(
      `${API_URL}/course-player/${courseId}/next`,
      config
    );
    
    if (response.data && response.data.id) {
      // Navigate to course player with the specific lesson
      window.location.href = `/course/${courseId}/learn?lesson=${response.data.id}`;
    } else {
      // No next lesson found, go to course overview
      window.location.href = `/course/${courseId}/learn`;
    }
  } catch (error) {
    console.error("Error getting next lesson:", error);
    // Fallback
    window.location.href = `/course/${courseId}/learn`;
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Learning</h1>
      <p className="text-gray-600 mb-8">Track your progress and manage your courses</p>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-8 gap-4">
        <div className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => {
              setActiveTab("courses");
              setSearchParams({ tab: "courses" });
            }}
            className={`flex items-center gap-2 pb-2 px-1 ${
              activeTab === "courses"
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Courses
            {purchasedCourses.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {purchasedCourses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("wishlist");
              setSearchParams({ tab: "wishlist" });
            }}
            className={`flex items-center gap-2 pb-2 px-1 ${
              activeTab === "wishlist"
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Wishlist
            {wishlistCourses.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {wishlistCourses.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <input
            type="text"
            placeholder="Search my courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 
                       focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100 
                       outline-none transition text-sm"
          />
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {/* Loading States */}
        {loading.courses && activeTab === "courses" && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your courses...</p>
          </div>
        )}

        {loading.wishlist && activeTab === "wishlist" && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your wishlist...</p>
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === "wishlist" && !loading.wishlist && (
          <>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="relative group">
                    <button
                      onClick={() => handleRemoveFromWishlist(course.id)}
                      className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg 
                               hover:bg-red-50 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                      title="Remove from wishlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Browse courses and click the heart icon to save them for later!
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  <Search className="w-4 h-4" />
                  Browse Courses
                </Link>
              </div>
            )}
          </>
        )}

        {/* MY COURSES TAB */}
        {activeTab === "courses" && !loading.courses && (
          <>
            {filteredCourses.length > 0 ? (
              <div className="space-y-6">
                {/* Progress Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Learning Progress</h3>
                      <p className="text-gray-600 text-sm">
                        {purchasedCourses.filter(c => getProgressPercent(c) === 100).length} of {purchasedCourses.length} courses completed
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {Math.round(
                            purchasedCourses.reduce((sum, course) => sum + getProgressPercent(course), 0) / 
                            Math.max(purchasedCourses.length, 1)
                          )}%
                        </div>
                        <div className="text-xs text-gray-500">Average Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {purchasedCourses.filter(c => getProgressPercent(c) > 0).length}
                        </div>
                        <div className="text-xs text-gray-500">Courses Started</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => {
                    const percent = getProgressPercent(course);
                    const status = getProgressStatus(percent);
                    const isCompleted = percent === 100;
                    const isInProgress = percent > 0 && percent < 100;

                    return (
                      <div
                        key={course.id}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="relative md:w-48">
                            <img
                              src={course.thumbnail_url || "https://via.placeholder.com/300x200"}
                              alt={course.title}
                              className="w-full h-48 md:h-40 object-cover rounded-xl"
                            />
                            {isCompleted && (
                              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                COMPLETED
                              </div>
                            )}
                            {isInProgress && (
                              <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                IN PROGRESS
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                                {course.title}
                              </h3>
                              {course.level && (
                                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {course.level}
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 text-sm mb-4">
                              {course.instructor || "Unknown Instructor"}
                            </p>

                            {/* Progress Section */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${getProgressTextColor(percent)}`}>
                                  {status} • {course.completed_lessons || 0}/{course.total_lessons || 0} lessons
                                </span>
                                <span className="text-sm font-bold text-gray-700">{percent}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {/* Course Info & Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                {course.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatDuration(course.duration)}
                                  </div>
                                )}
                                {course.rating && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    {course.rating.toFixed(1)} ({course.reviews || 0})
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => handleContinueLearning(course.id, e)}
                                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
                                    isCompleted
                                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                                      : "bg-primary text-white hover:bg-purple-700"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Review Course
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="w-4 h-4" />
                                      {isInProgress ? "Continue Learning" : "Start Course"}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses enrolled yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Start your learning journey by enrolling in courses that match your interests.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
                  >
                    <Search className="w-4 h-4" />
                    Browse Courses
                  </Link>
                  <Link
                    to="/student/dashboard"
                    className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading.courses && !loading.wishlist && searchTerm && filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500">
              No courses match "<span className="font-medium">{searchTerm}</span>"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}