import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { PlayCircle, ChevronDown, ChevronRight, CheckCircle, Check } from "lucide-react";
import logo from "../../assets/images/logo.png";
import QuizPlayer from "./QuizPlayer";

export default function CoursePlayer() {
  const { courseId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const token = localStorage.getItem("accessToken");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Fixed height for all content areas
  const CONTENT_HEIGHT = "70vh";

  // ============================
  // Progress Circle
  // ============================
  const ProgressCircle = ({ completed, total }) => {
    const percent = total === 0 ? 0 : (completed / total) * 100;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return (
      <svg width="40" height="40">
        <circle
          stroke="#334155"
          fill="transparent"
          strokeWidth="5"
          r={radius}
          cx="20"
          cy="20"
        />
        <circle
          stroke="#8b5cf6"
          fill="transparent"
          strokeWidth="5"
          strokeLinecap="round"
          r={radius}
          cx="20"
          cy="20"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text
          x="20"
          y="24"
          textAnchor="middle"
          fontSize="10"
          fill="#8b5cf6"
          fontWeight="bold"
        >
          {Math.round(percent)}%
        </text>
      </svg>
    );
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Helper function to find lesson by ID (needs to be declared before useEffect)
  const findLessonById = (lessonId) => {
    if (!sections || sections.length === 0) return null;
    
    for (const section of sections) {
      if (section.children) {
        const found = section.children.find(lesson => 
          lesson.id.toString() === lessonId.toString()
        );
        if (found) return found;
      }
    }
    return null;
  };

  // ============================
  // Handle browser back/forward buttons
  // ============================
  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const lessonId = urlParams.get('lesson');
      
      console.log("Popstate triggered, lessonId from URL:", lessonId);
      
      if (lessonId) {
        const foundLesson = findLessonById(lessonId);
        if (foundLesson) {
          console.log("Found lesson from popstate:", foundLesson);
          setCurrentLesson(foundLesson);
        } else {
          console.log("Lesson not found in sections:", lessonId);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [sections]); // Re-run when sections change

  // ============================
  // Fetch course, lessons, next lesson
  // ============================
  useEffect(() => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        
        // Check URL for specific lesson parameter
        const urlParams = new URLSearchParams(window.location.search);
        const lessonIdFromUrl = urlParams.get('lesson');
        
        // Fetch course info
        const courseRes = await axios.get(
          `${API_URL}/course-player/${courseId}`,
          config
        );
        console.log("Course data:", courseRes.data);
        setCourse(courseRes.data);

        // Fetch organized lessons/sections
        const lessonsRes = await axios.get(
          `${API_URL}/course-player/${courseId}/lessons`,
          config
        );
        console.log("Lessons/sections data:", lessonsRes.data);
        
        // Backend already organizes data, just use it directly
        const sectionsData = lessonsRes.data || [];
        setSections(sectionsData);
        
        // Expand all sections by default
        const defaultExpanded = new Set();
        sectionsData?.forEach(section => {
          if (section.id !== "standalone") {
            defaultExpanded.add(section.id);
          }
        });
        setExpandedSections(defaultExpanded);

        // Get completed lessons IDs
        const completedIds = await fetchCompletedLessons();
        setCompletedLessons(new Set(completedIds));

        // If there's a lesson ID in the URL, use it
        if (lessonIdFromUrl) {
          console.log("Found lesson ID in URL:", lessonIdFromUrl);
          // Find the lesson in the sections
          let foundLesson = null;
          for (const section of sectionsData) {
            if (section.children) {
              foundLesson = section.children.find(lesson => 
                lesson.id.toString() === lessonIdFromUrl
              );
              if (foundLesson) break;
            }
          }
          
          if (foundLesson) {
            console.log("Setting lesson from URL:", foundLesson);
            setCurrentLesson(foundLesson);
          } else {
            // Fallback to getting next lesson
            await getNextLessonFallback(sectionsData);
          }
        } else {
          // No URL parameter, get next lesson normally
          await getNextLessonFallback(sectionsData);
        }

      } catch (err) {
        console.error("COURSE PLAYER ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    // Helper function to get next lesson
    const getNextLessonFallback = async (sectionsData) => {
      try {
        const nextRes = await axios.get(
          `${API_URL}/course-player/${courseId}/next`,
          config
        );
        console.log("Next lesson from API:", nextRes.data);
        
        if (nextRes.data) {
          setCurrentLesson(nextRes.data);
        } else if (sectionsData && sectionsData.length > 0) {
          // Try to find first lesson from the sections
          for (const section of sectionsData) {
            if (section.children && section.children.length > 0) {
              setCurrentLesson(section.children[0]);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error getting next lesson:", error);
      }
    };

    loadData();
  }, [courseId, userId]);

  // Fetch completed lessons
  const fetchCompletedLessons = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/course-player/${courseId}/completed`,
        config
      );
      return response.data.completedLessonIds || [];
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
      return [];
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Get lesson icon based on type
  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4 text-purple-400" />;
      case "note":
        return <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold">T</div>;
      case "assessment":
        return <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center text-xs font-bold">Q</div>;
      default:
        return <PlayCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle lesson click
  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
    // Update URL without page reload
    window.history.pushState({}, '', `/course/${courseId}/learn?lesson=${lesson.id}`);
  };

  // ============================
  // Mark lesson complete manually (via checkbox)
  // ============================
  const handleManualComplete = async (lessonId, isCurrentlyCompleted) => {
    try {
      setUpdatingProgress(true);
      
      if (isCurrentlyCompleted) {
        // Mark as incomplete
        await axios.delete(
          `${API_URL}/course-player/${courseId}/lessons/${lessonId}/complete`,
          config
        );
        
        // Update local state
        const newCompleted = new Set(completedLessons);
        newCompleted.delete(lessonId);
        setCompletedLessons(newCompleted);
      } else {
        // Mark as complete
        await axios.post(
          `${API_URL}/course-player/${courseId}/lessons/${lessonId}/complete`,
          {},
          config
        );
        
        // Update local state
        const newCompleted = new Set(completedLessons);
        newCompleted.add(lessonId);
        setCompletedLessons(newCompleted);
      }
      
      // Refresh course data to update progress
      const courseRes = await axios.get(
        `${API_URL}/course-player/${courseId}`,
        config
      );
      setCourse(courseRes.data);
      
    } catch (err) {
      console.error("Error updating lesson completion:", err);
      alert("Failed to update lesson completion status");
    } finally {
      setUpdatingProgress(false);
    }
  };

  // ============================
  // Mark lesson complete (video auto-complete)
  // ============================
  const handleVideoEnd = async () => {
    try {
      setUpdatingProgress(true);
      await axios.post(
        `${API_URL}/course-player/${courseId}/lessons/${currentLesson.id}/complete`,
        {},
        config
      );
      
      // Update local state
      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLesson.id);
      setCompletedLessons(newCompleted);
      
      // Refresh course data
      const courseRes = await axios.get(
        `${API_URL}/course-player/${courseId}`,
        config
      );
      setCourse(courseRes.data);
      
      // Get next lesson
      const nextRes = await axios.get(
        `${API_URL}/course-player/${courseId}/next`,
        config
      );
      setCurrentLesson(nextRes.data);
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!course || course.total_lessons === 0) return 0;
    return Math.round((course.completed_lessons / course.total_lessons) * 100);
  };

  if (loading) {
    return <div className="text-white p-10">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-white p-10">Course not found</div>;
  }

// ============================
// Initialize course progress
// ============================
const initializeProgress = async () => {
  try {
    await axios.post(
      `${API_URL}/course-player/${courseId}/initialize-progress`,
      {},
      config
    );
    console.log("Course progress initialized");
  } catch (err) {
    console.error("Error initializing progress:", err);
  }
};


  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* ================= TOP BAR ================= */}
      <div className="w-full bg-slate-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between fixed top-0 z-50">
        {/* LEFT — Logo + Course Name */}
        <div className="flex items-center gap-4">
          <Link to="/student/dashboard">
            <img src={logo} alt="LearnLab Logo" className="h-10 w-auto object-contain" />
          </Link>

          <h1 className="font-bold text-lg truncate max-w-[350px]">
            {course.title}
          </h1>
        </div>

        {/* RIGHT — Progress + Circle + Rating */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="text-gray-300 text-sm font-semibold flex items-center gap-1">
                Your progress <span className="text-xs">▼</span>
              </button>

              <div className="absolute right-0 mt-2 bg-slate-800 border border-gray-700 rounded-lg p-3 w-48 hidden group-hover:block">
                <p className="text-xs text-gray-300 mb-1">
                  {course.completed_lessons} of {course.total_lessons} complete
                </p>
                <p className="text-xs text-purple-400 font-semibold">
                  {calculateCompletionPercentage()}% completed
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Click checkboxes to mark lessons complete
                </p>
              </div>
            </div>

            <ProgressCircle
              completed={course.completed_lessons}
              total={course.total_lessons}
            />
          </div>

          <button className="text-gray-300 text-sm hover:text-white">
            ★ {course.rating || "No rating"}
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex pt-[72px]">
        {/* LEFT CONTENT */}
        <div className="flex-1 mr-80">
          {/* CONTENT CONTAINER WITH FIXED HEIGHT */}
          <div className="bg-black" style={{ height: CONTENT_HEIGHT }}>
            
            {!currentLesson && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p>No lesson selected.</p>
                  <p className="text-sm mt-2">Select a lesson from the sidebar to begin</p>
                </div>
              </div>
            )}

            {/* 🎥 VIDEO */}
            {currentLesson?.type === "video" && currentLesson.video_url && (
              <div className="h-full w-full bg-black flex items-center justify-center">
                <video
                  key={currentLesson.video_url}
                  controls
                  autoPlay
                  onEnded={handleVideoEnd}
                  className="h-full w-full max-h-full object-contain"
                  src={currentLesson.video_url}
                />
              </div>
            )}

            {/* 📄 NOTE */}
            {currentLesson?.type === "note" && currentLesson.note_content && (
              <div className="h-full flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-gray-900">
                      {currentLesson.title}
                    </h1>
                    <div className="note-content-wrapper">
                      <div
                        className="prose prose-lg max-w-none !text-gray-900 [&_*]:!text-gray-900"
                        dangerouslySetInnerHTML={{ __html: currentLesson.note_content }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ❓ QUIZ */}
            {currentLesson?.type === "assessment" && (
              <div className="h-full flex flex-col bg-white">
                <QuizPlayer
                  lessonId={currentLesson.id}
                  courseId={courseId}
                  onQuizComplete={() => {
                    // Update local completed lessons state
                    const newCompleted = new Set(completedLessons);
                    newCompleted.add(currentLesson.id);
                    setCompletedLessons(newCompleted);
                    
                    // Refresh course data to update progress
                    const refreshCourseData = async () => {
                      try {
                        const courseRes = await axios.get(
                          `${API_URL}/course-player/${courseId}`,
                          config
                        );
                        setCourse(courseRes.data);
                        
                        // Get next lesson
                        const nextRes = await axios.get(
                          `${API_URL}/course-player/${courseId}/next`,
                          config
                        );
                        if (nextRes.data) {
                          setCurrentLesson(nextRes.data);
                        }
                      } catch (error) {
                        console.error("Error refreshing course data:", error);
                      }
                    };
                    
                    refreshCourseData();
                  }}
                />
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-4 bg-slate-800 text-sm border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold mb-1">Now Playing:</p>
                <p className="text-gray-300">{currentLesson?.title || "No lesson selected"}</p>
              </div>
              {currentLesson && (
                <button
                  onClick={() => handleManualComplete(currentLesson.id, completedLessons.has(currentLesson.id))}
                  disabled={updatingProgress}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                    completedLessons.has(currentLesson.id)
                      ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                      : "bg-purple-900/30 text-purple-400 hover:bg-purple-900/50"
                  }`}
                >
                  {updatingProgress ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  ) : completedLessons.has(currentLesson.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ================= BOTTOM INFO WITH TABS ================= */}
          <div className="p-6 bg-slate-900 border-t border-gray-800 text-gray-200">
            <div className="flex gap-6 border-b border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "overview"
                    ? "text-white border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "reviews"
                    ? "text-white border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Reviews
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">{course.title}</h2>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-yellow-400 font-bold">★ {course.rating}</span>
                  <span className="text-gray-400">{course.reviews} reviews</span>
                  <span className="text-gray-400">{course.students} students</span>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Last updated {formatLastUpdated(course.updated_at)}
                </p>

                <hr className="border-gray-700" />

                {/* Description */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-3">
                    <h3 className="font-semibold">Description</h3>
                  </div>
                  <div className="col-span-9">
                    <p className="text-gray-300 leading-relaxed">{course.description}</p>
                  </div>
                </div>

                <hr className="border-gray-700" />

                {/* Instructor */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-3">
                    <h3 className="font-semibold text-gray-200">Instructor</h3>
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <div className="flex items-start gap-4">
                      <img
                        src={course.instructor.photo}
                        alt={course.instructor.name}
                        className="w-20 h-20 rounded-full object-cover border border-gray-700"
                      />
                      <div>
                        <p className="font-semibold text-lg text-white">{course.instructor.name}</p>
                        <p className="text-sm text-gray-400 mb-2">{course.instructor.headline}</p>
                        <p className="text-gray-300 leading-relaxed text-sm">{course.instructor.biography}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Student Reviews</h3>
                {course.reviews === 0 && (
                  <p className="text-gray-400">No reviews yet. Be the first to leave one!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= FIXED RIGHT SIDEBAR ================= */}
        <div className="fixed top-[72px] right-0 w-80 h-[calc(100vh-72px)] bg-slate-900 border-l border-gray-800 flex flex-col z-40">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Course Content</h4>
              {/* <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                {calculateCompletionPercentage()}%
              </span> */}
            </div>
            {/* <p className="text-xs text-gray-400 mt-1">
              {course.completed_lessons} of {course.total_lessons} complete
            </p> */}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {sections.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No content available</p>
                <p className="text-sm mt-1">Check back later</p>
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.id || section.title} className="mb-2">
                  {/* SECTION HEADER */}
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                      section.type === "section" ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-800/50"
                    }`}
                    onClick={() => section.type === "section" && toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      {section.type === "section" && (
                        expandedSections.has(section.id) ? 
                          <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-semibold text-sm text-gray-200">
                        {section.title}
                      </span>
                    </div>
                    {section.type === "section" && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {section.children?.length || 0} lessons
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SECTION CHILDREN */}
                  {(section.type !== "section" || expandedSections.has(section.id)) && (
                    <div className={`${section.type === "section" ? "ml-4" : ""} mt-1 space-y-1`}>
                      {section.children && section.children.length > 0 ? (
                        section.children.map((lesson) => {
                          const isCompleted = completedLessons.has(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-2 p-3 rounded-lg transition group ${
                                currentLesson && currentLesson.id === lesson.id
                                  ? "bg-purple-900/30 border border-purple-700"
                                  : "hover:bg-slate-800"
                              }`}
                            >
                              {/* CHECKBOX */}
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() => handleManualComplete(lesson.id, isCompleted)}
                                  disabled={updatingProgress}
                                  className="h-4 w-4 rounded border-gray-600 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer"
                                />
                              </div>
                              
                              {/* LESSON CONTENT */}
                              <div 
                                className="flex-1 flex items-center gap-3 cursor-pointer"
                                onClick={() => handleLessonClick(lesson)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    {getLessonIcon(lesson.type)}
                                    {isCompleted && (
                                      <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 bg-slate-900 rounded-full" />
                                    )}
                                  </div>
                                  <div className="relative w-12 h-8 bg-gray-800 rounded overflow-hidden shrink-0">
                                    <img
                                      src={course.image}
                                      className="w-full h-full object-cover opacity-40"
                                      alt=""
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <PlayCircle className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <p className={`text-sm font-medium truncate ${
                                      isCompleted ? "text-gray-400 line-through" : "text-gray-200"
                                    }`}>
                                      {lesson.title}
                                    </p>
                                    {lesson.duration_seconds && (
                                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                                        {formatTime(lesson.duration_seconds)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-gray-300">
                                      {lesson.type}
                                    </span>
                                    {lesson.is_preview && (
                                      <span className="text-xs px-2 py-0.5 bg-blue-900/30 rounded text-blue-300">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No lessons in this section
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}