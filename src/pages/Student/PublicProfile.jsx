import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  User, 
  BookOpen, 
  Heart, 
  Search, 
  Star, 
  Clock, 
  Briefcase,
  Users,
  Award,
  ChevronRight,
  X,
  Loader2,
  Video
} from "lucide-react";

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("learning");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFilter, setSearchFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get public profile from userRoutes
        const profileRes = await axios.get(`${API_URL}/users/public-profile/${id}`);
        const userProfile = profileRes.data;
        
        setProfile(userProfile);
        
        // Fetch user-specific data based on role
        if (userProfile.role === 'student') {
          // Fetch purchased courses from studentRoutes
          try {
            const purchasedRes = await axios.get(`${API_URL}/student/${id}/courses`);
            setPurchasedCourses(purchasedRes.data || []);
          } catch (err) {
            console.log("Purchased courses endpoint not available", err);
            setPurchasedCourses([]);
          }
          
          // Fetch wishlist from studentRoutes
          try {
            const wishlistRes = await axios.get(`${API_URL}/student/${id}/wishlist`);
            setWishlistCourses(wishlistRes.data || []);
          } catch (err) {
            console.log("Wishlist endpoint not available", err);
            setWishlistCourses([]);
          }
          
          setActiveTab("learning");
        } else if (userProfile.role === 'instructor') {
          // Fetch instructor courses from userRoutes
          try {
            const coursesRes = await axios.get(`${API_URL}/users/instructor/${id}/courses`);
            setInstructorCourses(coursesRes.data || []);
            setActiveTab("courses");
          } catch (err) {
            console.error("Error fetching instructor courses:", err);
            setInstructorCourses([]);
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  // Search users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const res = await axios.get(
        `${API_URL}/users/search?q=${encodeURIComponent(searchQuery)}${searchFilter !== 'all' ? `&type=${searchFilter}` : ''}`
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Determine what courses to show based on user role and active tab
  const getCoursesToShow = () => {
    if (profile?.role === 'instructor') {
      return instructorCourses;
    } else {
      return activeTab === "learning" ? purchasedCourses : wishlistCourses;
    }
  };

  const coursesToShow = getCoursesToShow();

  // Generate star rating
  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if no profile
  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The user you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="relative group">
                <div className="flex items-center border border-gray-200 rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-purple-100 bg-gray-50/50 focus-within:bg-white">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for learners or instructors..."
                    className="flex-1 pl-12 pr-32 py-3 outline-none bg-transparent"
                  />
                  
                  {/* Search Filter Dropdown */}
                  <select
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="absolute right-12 top-2.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="all">All Users</option>
                    <option value="learners">Learners Only</option>
                    <option value="instructors">Instructors Only</option>
                  </select>
                  
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-3.5"
                    >
                      <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((user) => (
                        <Link
                          key={user.id}
                          to={`/student/public-profile/${user.id}`}
                          onClick={() => clearSearch()}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {user.photo_url ? (
                              <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-white font-bold ${
                                user.role === 'instructor' 
                                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                                  : 'bg-gradient-to-br from-primary to-purple-600'
                              }`}>
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {user.first_name} {user.last_name}
                              </h4>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                user.role === 'instructor'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {user.role === 'instructor' ? 'Instructor' : 'Learner'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {user.occupation || user.headline || (user.role === 'instructor' ? 'Instructor' : 'Learner')}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No users found</p>
                      <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR - Profile Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
              
              {/* Profile Header with Gradient */}
              <div className={`h-24 bg-gradient-to-r ${
                profile?.role === 'instructor' 
                  ? 'from-blue-600 to-indigo-600' 
                  : 'from-primary to-purple-600'
              } relative`}>
                <div className="absolute -bottom-12 left-6">
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r rounded-full blur-md opacity-70 ${
                      profile?.role === 'instructor'
                        ? 'from-blue-600 to-indigo-600'
                        : 'from-primary to-purple-600'
                    }`}></div>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                      {profile?.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-white text-3xl font-bold ${
                          profile?.role === 'instructor'
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                            : 'bg-gradient-to-br from-primary to-purple-600'
                        }`}>
                          {profile?.first_name?.[0] || 'U'}
                          {profile?.last_name?.[0] || ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile?.first_name} {profile?.last_name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profile?.role === 'instructor'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gradient-to-r from-primary/10 to-purple-100 text-primary'
                      }`}>
                        {profile?.role === 'instructor' ? 'Instructor' : 'Learner'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Occupation & Headline */}
                <div className="space-y-2 mb-6">
                  {profile?.occupation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{profile.occupation}</span>
                    </div>
                  )}
                  {profile?.headline && (
                    <p className="text-sm text-gray-600 italic">
                      "{profile.headline}"
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className={`grid ${profile?.role === 'instructor' ? 'grid-cols-1' : 'grid-cols-2'} gap-4 p-4 bg-gray-50 rounded-xl mb-6`}>
                  {profile?.role === 'student' ? (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(purchasedCourses.length)}
                        </div>
                        <div className="text-xs text-gray-500">Courses Purchased</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(wishlistCourses.length)}
                        </div>
                        <div className="text-xs text-gray-500">Wishlist</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(instructorCourses.length)}
                      </div>
                      <div className="text-xs text-gray-500">Published Courses</div>
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                {profile?.biography && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <User className={`w-4 h-4 ${
                        profile?.role === 'instructor' ? 'text-blue-600' : 'text-primary'
                      }`} />
                      About
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {profile.biography}
                    </p>
                  </div>
                )}

                {/* Skills Section for Instructors */}
                {profile?.role === 'instructor' && profile?.skills && (
                  <div className="border-t border-gray-100 pt-6 mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {typeof profile.skills === 'string' 
                        ? profile.skills.split(',').map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))
                        : Array.isArray(profile.skills) && profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))
                      }
                    </div>
                  </div>
                )}

                {/* Field of Learning for Students */}
                {profile?.role === 'student' && profile?.field_of_learning && (
                  <div className="border-t border-gray-100 pt-6 mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Field of Learning
                    </h3>
                    <p className="text-sm text-gray-600">
                      {profile.field_of_learning}
                    </p>
                  </div>
                )}

                {/* Interests for Students */}
                {profile?.role === 'student' && profile?.interests && (
                  <div className="border-t border-gray-100 pt-6 mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {typeof profile.interests === 'string' 
                        ? profile.interests.split(',').map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium"
                            >
                              {interest.trim()}
                            </span>
                          ))
                        : Array.isArray(profile.interests) && profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium"
                            >
                              {interest}
                            </span>
                          ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT - Courses */}
          <div className="lg:col-span-8">
            
            {/* Tabs */}
            <div className="bg-white rounded-t-xl border-b border-gray-200 px-6">
              <div className="flex items-center gap-8">
                {profile?.role === 'student' ? (
                  <>
                    <button
                      onClick={() => setActiveTab("learning")}
                      className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition ${
                        activeTab === "learning"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Learning
                      <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {purchasedCourses.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("wishlist")}
                      className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition ${
                        activeTab === "wishlist"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      Wishlist
                      <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {wishlistCourses.length}
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    className="flex items-center gap-2 py-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600"
                  >
                    <Video className="w-4 h-4" />
                    Courses
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {instructorCourses.length}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Course Grid */}
            <div className="bg-white rounded-b-2xl p-6">
              {coursesToShow.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                    {profile?.role === 'instructor' ? (
                      <Video className="w-8 h-8 text-gray-400" />
                    ) : activeTab === "learning" ? (
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    ) : (
                      <Heart className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {profile?.role === 'instructor' 
                      ? 'No courses published yet' 
                      : `No ${activeTab === "learning" ? "courses" : "wishlist items"} yet`}
                  </h3>
                  {profile?.role === 'instructor' && (
                    <p className="text-sm text-gray-500">
                      This instructor hasn't published any courses yet
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {coursesToShow.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="block group"
                    >
                      <div className="flex flex-col sm:flex-row gap-5 p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                        
                        {/* Course Thumbnail */}
                        <div className="sm:w-48 flex-shrink-0">
                          <div className="relative aspect-video rounded-lg overflow-hidden">
                            <img
                              src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold text-gray-900 group-hover:${
                            profile?.role === 'instructor' ? 'text-blue-600' : 'text-primary'
                          } transition mb-1`}>
                            {course.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {course.instructor_name || course.instructor || `${profile?.first_name} ${profile?.last_name}`}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-gray-900">
                              {course.rating?.toFixed(1) || "4.5"}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {renderStars(course.rating || 4.5)}
                            </div>
                            <span className="text-xs text-gray-500">
                              ({formatNumber(course.reviews_count || course.reviews || 0)} reviews)
                            </span>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            {course.hours > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {course.hours} total hours
                              </span>
                            )}
                            {course.lectures > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {course.lectures} lectures
                              </span>
                            )}
                            {course.total_lessons > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {course.total_lessons} lessons
                              </span>
                            )}
                            {course.students_enrolled > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {formatNumber(course.students_enrolled)} students
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              profile?.role === 'instructor'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {course.level || "All Levels"}
                            </span>
                          </div>

                          {/* Progress Bar for Purchased Courses */}
                          {profile?.role === 'student' && activeTab === "learning" && course.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Completed Lessons for Purchased Courses */}
                          {profile?.role === 'student' && activeTab === "learning" && course.completed_lessons !== undefined && course.total_lessons > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {course.completed_lessons} of {course.total_lessons} lessons completed
                            </div>
                          )}
                        </div>

                        {/* Price/CTA */}
                        <div className="flex items-center">
                          <span className={`text-sm font-semibold group-hover:underline ${
                            profile?.role === 'instructor' ? 'text-blue-600' : 'text-primary'
                          }`}>
                            View Course
                          </span>
                          <ChevronRight className={`w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition ${
                            profile?.role === 'instructor' ? 'text-blue-600' : 'text-primary'
                          }`} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}