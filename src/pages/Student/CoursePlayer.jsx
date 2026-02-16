import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlayCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Check,
  Star,
  Edit,
  Trash2,
  X,
  ChevronUp,
  Target,
} from "lucide-react";
import logo from "../../assets/images/logo.png";
import QuizPlayer from "./QuizPlayer";
import { toast } from "react-hot-toast";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

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
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [certificateMessage, setCertificateMessage] = useState("");
  const [hasCertificate, setHasCertificate] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [parsedRequirements, setParsedRequirements] = useState([]);
  const [parsedAudience, setParsedAudience] = useState([]);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

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

  const safelyParseJSON = (data) => {
    if (!data) return [];
    try {
      if (Array.isArray(data)) return data;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("JSON Parse fallback:", error);
      return [data];
    }
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const formatReviewDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to find lesson by ID
  const findLessonById = (lessonId) => {
    if (!sections || sections.length === 0) return null;

    for (const section of sections) {
      if (section.children) {
        const found = section.children.find(
          (lesson) => lesson.id.toString() === lessonId.toString(),
        );
        if (found) return found;
      }
    }
    return null;
  };

  const findNextLesson = (currentLessonId) => {
    if (!sections || sections.length === 0 || !currentLessonId) return null;
    
    // Flatten all lessons from all sections in order
    const allLessons = [];
    sections.forEach(section => {
      if (section.children && section.children.length > 0) {
        // Sort lessons by order_index if available
        const sortedLessons = [...section.children].sort((a, b) => 
          (a.order_index || 0) - (b.order_index || 0)
        );
        allLessons.push(...sortedLessons);
      }
    });

    // Find current lesson index
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    
    // Return next lesson if exists
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    
    return null;
  };

  // ============================
  // Fetch Reviews
  // ============================
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/reviews`,
        config
      );
      setReviews(response.data.reviews || []);
      setUserReview(response.data.userReview || null);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ============================
  // Submit Review
  // ============================
  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      alert("Please write a review comment");
      return;
    }

    try {
      setSubmittingReview(true);

      if (userReview) {
        // Update existing review
        await axios.put(
          `${API_URL}/courses/${courseId}/reviews/${userReview.id}`,
          reviewForm,
          config
        );
      } else {
        // Create new review
        await axios.post(
          `${API_URL}/courses/${courseId}/reviews`,
          reviewForm,
          config
        );
      }

      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: "" });
      fetchReviews();

      // Refresh course data to update average rating
      const courseRes = await axios.get(
        `${API_URL}/course-player/${courseId}`,
        config
      );
      setCourse(courseRes.data);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ============================
  // Delete Review
  // ============================
  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      await axios.delete(
        `${API_URL}/courses/${courseId}/reviews/${userReview.id}`,
        config
      );
      setUserReview(null);
      fetchReviews();

      // Refresh course data
      const courseRes = await axios.get(
        `${API_URL}/course-player/${courseId}`,
        config
      );
      setCourse(courseRes.data);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  // ============================
  // Open Edit Review Modal
  // ============================
  const handleEditReview = () => {
    setReviewForm({
      rating: userReview.rating,
      comment: userReview.comment,
    });
    setShowReviewModal(true);
  };

  // ============================
  // Render Star Rating
  // ============================
  const StarRating = ({ rating, size = "w-4 h-4", interactive = false, onRatingChange = null }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            } ${interactive ? "cursor-pointer hover:fill-yellow-400 hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  // ============================
  // Handle browser back/forward buttons
  // ============================
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const lessonId = urlParams.get("lesson");

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

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sections]);

  useEffect(() => {
    async function checkCertificate() {
      try {
        const res = await axios.get(`${API_URL}/student/certificates`, config);
        const hasCert = res.data?.data?.some(
          (c) => c.courseId?.toString() === courseId.toString(),
        );
        if (hasCert) {
          setHasCertificate(true);
          setCertificateMessage("Certificate already issued for this course.");
        }
      } catch (e) {
        console.error("Error checking certificate:", e);
      }
    }

    if (userId) {
      checkCertificate();
    }
  }, [courseId, userId]);

  useEffect(() => {
    if (certificateIssued) {
      navigate(`/student/certificates/${courseId}`);
    }
  }, [certificateIssued, courseId, navigate]);

  // ============================
  // Fetch reviews when Reviews tab is active
  // ============================
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, courseId]);

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
        const lessonIdFromUrl = urlParams.get("lesson");

        // Fetch course info
        const courseRes = await axios.get(
          `${API_URL}/course-player/${courseId}`,
          config,
        );
        console.log("Course data:", courseRes.data);
        setCourse(courseRes.data);

        // Parse requirements and target audience
        if (courseRes.data.requirements) {
          setParsedRequirements(safelyParseJSON(courseRes.data.requirements));
        }
        if (courseRes.data.target_audience) {
          setParsedAudience(safelyParseJSON(courseRes.data.target_audience));
        }

        // Fetch organized lessons/sections
        const lessonsRes = await axios.get(
          `${API_URL}/course-player/${courseId}/lessons`,
          config,
        );
        console.log("Lessons/sections data:", lessonsRes.data);

        // Backend already organizes data, just use it directly
        const sectionsData = lessonsRes.data || [];
        setSections(sectionsData);

        // Expand all sections by default
        const defaultExpanded = new Set();
        sectionsData?.forEach((section) => {
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
              foundLesson = section.children.find(
                (lesson) => lesson.id.toString() === lessonIdFromUrl,
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
        console.error(
          "COURSE PLAYER ERROR:",
          err.response?.data || err.message,
        );
      } finally {
        setLoading(false);
      }
    }

    // Helper function to get next lesson
    const getNextLessonFallback = async (sectionsData) => {
      try {
        const nextRes = await axios.get(
          `${API_URL}/course-player/${courseId}/next`,
          config,
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
        config,
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
        return (
          <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold">
            T
          </div>
        );
      case "assessment":
        return (
          <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center text-xs font-bold">
            Q
          </div>
        );
      default:
        return <PlayCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle lesson click
  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
    // Update URL without page reload
    window.history.pushState(
      {},
      "",
      `/course/${courseId}/learn?lesson=${lesson.id}`,
    );
  };

  // ============================
  // Mark lesson complete manually (via checkbox) - UPDATED with optimistic update
  // ============================
  const handleManualComplete = async (lessonId, isCurrentlyCompleted) => {
    try {
      setUpdatingProgress(true);

      // Update local state immediately for instant UI feedback
      const newCompleted = new Set(completedLessons);
      if (isCurrentlyCompleted) {
        newCompleted.delete(lessonId);
      } else {
        newCompleted.add(lessonId);
      }
      setCompletedLessons(newCompleted);

      if (isCurrentlyCompleted) {
        // Mark as incomplete
        await axios.delete(
          `${API_URL}/course-player/${courseId}/lessons/${lessonId}/complete`,
          config,
        );
      } else {
        // Mark as complete
        const res = await axios.post(
          `${API_URL}/course-player/${courseId}/lessons/${lessonId}/complete`,
          {},
          config,
        );

        if (res.data?.certificateIssued) {
          setCertificateIssued(true);
          setCertificateMessage(
            res.data.certificateReason || "Certificate issued for this course!",
          );
        }
      }

      // Refresh course data to update progress count (but keep checkbox state)
      const courseRes = await axios.get(
        `${API_URL}/course-player/${courseId}`,
        config,
      );
      setCourse(courseRes.data);
    } catch (err) {
      console.error("Error updating lesson completion:", err);
      // Revert the optimistic update if there's an error
      const revertedCompleted = new Set(completedLessons);
      if (isCurrentlyCompleted) {
        revertedCompleted.add(lessonId);
      } else {
        revertedCompleted.delete(lessonId);
      }
      setCompletedLessons(revertedCompleted);
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
      const res = await axios.post(
        `${API_URL}/course-player/${courseId}/lessons/${currentLesson.id}/complete`,
        {},
        config,
      );

      if (res.data?.certificateIssued) {
        setCertificateIssued(true);
        setCertificateMessage(
          res.data.certificateReason || "Certificate issued for this course!",
        );
      }

      // Update local state
      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLesson.id);
      setCompletedLessons(newCompleted);

      // Refresh course data
      const courseRes = await axios.get(
        `${API_URL}/course-player/${courseId}`,
        config,
      );
      setCourse(courseRes.data);

      // Get next lesson
      const nextRes = await axios.get(
        `${API_URL}/course-player/${courseId}/next`,
        config,
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

  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/certificates/${courseId}/download`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Certificate download failed:", err);
      alert("Failed to download certificate");
    }
  };

  if (loading) {
    return <div className="text-white p-10">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-white p-10">Course not found</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ================= REVIEW MODAL ================= */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {userReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <StarRating
                  rating={reviewForm.rating}
                  size="w-8 h-8"
                  interactive={true}
                  onRatingChange={(rating) =>
                    setReviewForm({ ...reviewForm, rating })
                  }
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Share your thoughts about this course..."
                  className="w-full h-32 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview
                    ? "Submitting..."
                    : userReview
                      ? "Update Review"
                      : "Submit Review"}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP BAR (Original Dark Theme) ================= */}
      <div className="w-full bg-slate-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between fixed top-0 z-50">
        {/* LEFT — Logo + Course Name */}
        <div className="flex items-center gap-4">
          <Link to="/student/dashboard">
            <img
              src={logo}
              alt="LearnLab Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <h1 className="font-bold text-lg truncate max-w-[350px] text-white">
            {course.title}
          </h1>
        </div>

        {/* RIGHT — Progress + Circle + Rating + Certificate */}
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

          {(hasCertificate || certificateIssued) && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCertificate}
                className="inline-flex items-center px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
              >
                Download Certificate
              </button>

              <button
                onClick={() => navigate(`/student/certificates/${courseId}`)}
                className="inline-flex items-center px-3 py-1 rounded bg-slate-700 text-white text-xs font-semibold hover:bg-slate-600"
              >
                View Certificate
              </button>
            </div>
          )}
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
                  <p className="text-sm mt-2">
                    Select a lesson from the sidebar to begin
                  </p>
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
                        dangerouslySetInnerHTML={{
                          __html: currentLesson.note_content,
                        }}
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
                  onQuizComplete={async ({
                    certificateIssued: certIssued,
                    certificateReason,
                  } = {}) => {
                    // Update local completed lessons state
                    const newCompleted = new Set(completedLessons);
                    newCompleted.add(currentLesson.id);
                    setCompletedLessons(newCompleted);

                    if (certIssued) {
                      setCertificateIssued(true);
                      setCertificateMessage(
                        certificateReason ||
                          "Certificate issued for this course!",
                      );
                    }

                    // Refresh course data to update progress
                    const refreshCourseData = async () => {
                      try {
                        const courseRes = await axios.get(
                          `${API_URL}/course-player/${courseId}`,
                          config,
                        );
                        setCourse(courseRes.data);

                        // Get next lesson
                        const nextRes = await axios.get(
                          `${API_URL}/course-player/${courseId}/next`,
                          config,
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

          {/* FOOTER - "Now Playing" section */}
          <div className="p-4 bg-slate-800 text-sm border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold mb-1 text-white">Now Playing:</p>
                <p className="text-gray-300">
                  {currentLesson?.title || "No lesson selected"}
                </p>
              </div>
              {currentLesson && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleManualComplete(
                        currentLesson.id,
                        completedLessons.has(currentLesson.id),
                      )
                    }
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

                  {/* Next Lesson Button - Goes to next lesson regardless of completion */}
                  <button
                    onClick={() => {
                      const nextLesson = findNextLesson(currentLesson?.id);
                      if (nextLesson) {
                        setCurrentLesson(nextLesson);
                        // Update URL without page reload
                        window.history.pushState(
                          {},
                          "",
                          `/course/${courseId}/learn?lesson=${nextLesson.id}`,
                        );
                      } else {
                        toast?.success("You've reached the end of the course!");
                      }
                    }}
                    disabled={!currentLesson}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= BOTTOM INFO WITH TABS (White Theme) ================= */}
          <div className="p-6 bg-white border-t border-gray-200 text-gray-900">
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "overview"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "reviews"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Reviews
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-yellow-600 font-bold">
                    ★ {course.rating}
                  </span>
                  <span className="text-gray-600">
                    {course.reviews} reviews
                  </span>
                  <span className="text-gray-600">
                    {course.students} students
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Last updated {formatLastUpdated(course.updated_at)}
                </p>

                <hr className="border-gray-200" />

                {/* Description with Read More - Everything below is collapsible */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-3">
                    <h3 className="font-semibold text-gray-700">Description</h3>
                  </div>
                  <div className="col-span-9">
                    {/* Short description - always visible */}
                    <p className="text-gray-700 leading-relaxed">
                      {course.description}
                    </p>
                    
                    {/* Read More Toggle Button - Show if there's additional content */}
                    {(parsedRequirements.length > 0 || parsedAudience.length > 0) && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-3 focus:outline-none flex items-center gap-1"
                      >
                        {showFullDescription ? (
                          <>Show less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Read more <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                    )}

                    {/* Collapsible Content - Requirements and Target Audience */}
                    {showFullDescription && (
                      <div className="mt-6 space-y-6 animate-fadeIn">
                        {/* Requirements Section */}
                        {parsedRequirements.length > 0 && (
                          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-purple-600" />
                              Requirements / What you'll need
                            </h4>
                            <div className="space-y-2">
                              {parsedRequirements.map((req, index) => (
                                <div key={index} className="flex gap-3 items-start text-sm">
                                  <CheckCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Target Audience Section */}
                        {parsedAudience.length > 0 && (
                          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-600" />
                              Who this course is for
                            </h4>
                            <div className="space-y-2">
                              {parsedAudience.map((audience, index) => (
                                <div key={index} className="flex gap-3 items-start text-sm">
                                  <Target className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{audience}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Instructor */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-3">
                    <h3 className="font-semibold text-gray-700">Instructor</h3>
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <div className="flex items-start gap-4">
                      <img
                        src={course.instructor?.photo || "/default-avatar.png"}
                        alt={course.instructor?.name}
                        className="w-20 h-20 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-lg text-gray-900">
                          {course.instructor?.name}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {course.instructor?.headline}
                        </p>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {course.instructor?.biography}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Header with Add/Edit Review Button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Student Reviews</h3>

                  {!userReview ? (
                    <button
                      onClick={() => {
                        setReviewForm({ rating: 5, comment: "" });
                        setShowReviewModal(true);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleEditReview}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteReview}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Your Review */}
                {userReview && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={user?.photo || user?.profile_picture || "/default-avatar.png"}
                        alt={user?.name || `${user?.first_name} ${user?.last_name}`}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user?.name || `${user?.first_name} ${user?.last_name}`} (You)
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={userReview.rating} />
                              <span className="text-xs text-gray-500">
                                {formatReviewDate(userReview.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {userReview.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loadingReviews && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <p className="text-gray-500 mt-2">Loading reviews...</p>
                  </div>
                )}

                {/* Reviews List */}
                {!loadingReviews && reviews.length === 0 && !userReview && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No reviews yet. Be the first to leave one!
                    </p>
                  </div>
                )}

                {!loadingReviews && reviews.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-700">
                      Other Reviews ({reviews.length})
                    </h4>
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={
                              review.student?.photo || 
                              review.student?.profile_picture || 
                              review.Users?.photo ||
                              review.Users?.profile_picture ||
                              "/default-avatar.png"
                            }
                            alt={
                              review.student?.name || 
                              (review.student?.first_name && review.student?.last_name
                                ? `${review.student.first_name} ${review.student.last_name}`
                                : review.Users?.name ||
                                  (review.Users?.first_name && review.Users?.last_name
                                    ? `${review.Users.first_name} ${review.Users.last_name}`
                                    : "Student"))
                            }
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {review.student?.name || 
                                  (review.student?.first_name && review.student?.last_name
                                    ? `${review.student.first_name} ${review.student.last_name}`
                                    : review.Users?.name ||
                                      (review.Users?.first_name && review.Users?.last_name
                                        ? `${review.Users.first_name} ${review.Users.last_name}`
                                        : "Anonymous Student"))}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <StarRating rating={review.rating} />
                                  <span className="text-xs text-gray-500">
                                    {formatReviewDate(review.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= FIXED RIGHT SIDEBAR (White Theme) ================= */}
        <div className="fixed top-[72px] right-0 w-80 h-[calc(100vh-72px)] bg-white border-l border-gray-200 flex flex-col z-40 shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900">Course Content</h4>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {sections.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No content available</p>
                <p className="text-sm mt-1">Check back later</p>
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.id || section.title} className="mb-2">
                  {/* SECTION HEADER */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                      section.type === "section"
                        ? "bg-gray-100 hover:bg-gray-200"
                        : "bg-gray-50"
                    }`}
                    onClick={() =>
                      section.type === "section" && toggleSection(section.id)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {section.type === "section" &&
                        (expandedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        ))}
                      <span className="font-semibold text-sm text-gray-800">
                        {section.title}
                      </span>
                    </div>
                    {section.type === "section" && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {section.children?.length || 0} lessons
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SECTION CHILDREN */}
                  {(section.type !== "section" ||
                    expandedSections.has(section.id)) && (
                    <div
                      className={`${section.type === "section" ? "ml-4" : ""} mt-1 space-y-1`}
                    >
                      {section.children && section.children.length > 0 ? (
                        section.children.map((lesson) => {
                          const isCompleted = completedLessons.has(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-2 p-3 rounded-lg transition group ${
                                currentLesson && currentLesson.id === lesson.id
                                  ? "bg-purple-50 border border-purple-200"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {/* CHECKBOX */}
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() =>
                                    handleManualComplete(lesson.id, isCompleted)
                                  }
                                  disabled={updatingProgress}
                                  className="h-4 w-4 rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500 cursor-pointer"
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
                                      <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <div className="relative w-12 h-8 bg-gray-100 rounded overflow-hidden shrink-0">
                                    <img
                                      src={course.image}
                                      className="w-full h-full object-cover opacity-40"
                                      alt=""
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <PlayCircle className="w-3 h-3 text-gray-600" />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <p
                                      className={`text-sm font-medium truncate ${
                                        isCompleted
                                          ? "text-gray-400 line-through"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {lesson.title}
                                    </p>
                                    {lesson.duration_seconds && (
                                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                                        {formatTime(lesson.duration_seconds)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                      {lesson.type}
                                    </span>
                                    {lesson.is_preview && (
                                      <span className="text-xs px-2 py-0.5 bg-blue-100 rounded text-blue-700">
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