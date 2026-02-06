import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { PlayCircle } from "lucide-react";
import logo from "../../assets/images/logo.png";

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
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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
        const courseRes = await axios.get(
          `${API_URL}/course-player/${courseId}`,
          config
        );
        setCourse(courseRes.data);

        const lessonsRes = await axios.get(
          `${API_URL}/course-player/${courseId}/lessons`,
          config
        );
        setLessons(lessonsRes.data);

        const nextRes = await axios.get(
          `${API_URL}/course-player/${courseId}/next`,
          config
        );
        setCurrentLesson(nextRes.data);
      } catch (err) {
        console.error("COURSE PLAYER ERROR:", err.response?.data || err.message);
      }
    }

    loadData();
  }, [courseId, userId]);

  // ============================
  // Mark lesson complete
  // ============================
  const handleVideoEnd = async () => {
    try {
      await axios.post(
        `${API_URL}/course-player/${courseId}/lessons/${currentLesson.id}/complete`,
        {},
        config
      );
      const nextRes = await axios.get(
        `${API_URL}/course-player/${courseId}/next`,
        config
      );
      setCurrentLesson(nextRes.data);
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  if (!course) {
    return <div className="text-white p-10">Loading course...</div>;
  }

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

              <div className="absolute right-0 mt-2 bg-slate-800 border border-gray-700 rounded-lg p-3 w-40 hidden group-hover:block">
                <p className="text-xs text-gray-300">
                  {course.completed_lessons} of {course.total_lessons} complete
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
          {/* VIDEO PLAYER */}
          <div className="flex-1 bg-black flex flex-col min-h-[60vh]">
            <div className="flex-1 flex items-center justify-center bg-black">
              {currentLesson && currentLesson.video_url ? (
                <video
                  key={currentLesson.video_url}
                  controls
                  autoPlay
                  onEnded={handleVideoEnd}
                  className="w-full h-full object-contain"
                  src={currentLesson.video_url}
                />
              ) : (
                <div className="text-gray-400 text-center">
                  No video available for this lesson.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800 text-sm border-t border-gray-700">
              <p className="font-bold mb-1">Now Playing:</p>
              <p className="text-gray-300">
                {currentLesson ? currentLesson.title : "No lesson selected"}
              </p>
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
            <h4 className="font-bold">Course Content</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {Array.isArray(lessons) &&
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    currentLesson && currentLesson.id === lesson.id
                      ? "bg-slate-800"
                      : "hover:bg-slate-800"
                  }`}
                >
                  <div className="relative w-16 h-10 bg-gray-800 rounded overflow-hidden shrink-0">
                    <img
                      src={course.image}
                      className="w-full h-full object-cover opacity-60"
                      alt=""
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-200">
                      {lesson.title}
                    </p>
                    <p className="text-xs text-gray-500">{lesson.time}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
