import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { PlayCircle } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";

export default function CoursePlayer() {
  const { courseId } = useParams();
//   const API_URL = import.meta.env.VITE_API_URL;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


  const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    
  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // ============================
  // CIRCLE PROGRESS COMPONENT
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


  // ============================
  // FETCH COURSE + LESSONS + NEXT LESSON
  // ============================
    useEffect(() => {
  if (!userId) {
    window.location.href = "/login";
    return;
  }

  async function loadData() {
    try {
      // Fetch course player data
      const courseRes = await axios.get(
        `${API_URL}/course-player/${courseId}`,
        authHeader
      );
      setCourse(courseRes.data);

      // Fetch lessons
      const lessonsRes = await axios.get(
        `${API_URL}/course-player/${courseId}/lessons`,
        authHeader
      );
      setLessons(lessonsRes.data);

      // Fetch next lesson
      const nextRes = await axios.get(
        `${API_URL}/course-player/${courseId}/next`,
        authHeader
      );
      setCurrentLesson(nextRes.data);
    } catch (err) {
      console.error("Error loading course player:", err);
    }
  }

  loadData();
}, [courseId, userId]);


  // ============================
  // MARK LESSON COMPLETE + LOAD NEXT
  // ============================
  const handleVideoEnd = async () => {
    try {
      await axios.post(
        `${API_URL}/course-player/${courseId}/lessons/${currentLesson.id}/complete`,
        {},
        authHeader
      );

      const nextRes = await axios.get(
        `${API_URL}/course-player/${courseId}/next`,
        authHeader
      );
      setCurrentLesson(nextRes.data);
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  // ============================
  // SAFE LOADING
  // ============================
  if (!course || !currentLesson) {
    return <div className="text-white p-10">Loading course...</div>;
  }

return (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col">

    {/* ================= TOP BAR ================= */}
    <div className="w-full bg-slate-800 border-b border-gray-700 px-6 py-4 
        flex items-center justify-between">

      {/* LEFT — Logo + Course Name */}
      <div className="flex items-center gap-4">
        <Link to="/student/dashboard">
          <img
            src={logo}
            alt="LearnLab Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <h1 className="font-bold text-lg truncate max-w-[350px]">
          {course.title}
        </h1>
      </div>

      {/* RIGHT — Progress + Circle + Rating */}
      <div className="flex items-center gap-6">

        {/* PROGRESS + CIRCLE TOGETHER */}
        <div className="flex items-center gap-2">

          {/* PROGRESS DROPDOWN */}
          <div className="relative group">
            <button className="text-gray-300 text-sm font-semibold flex items-center gap-1">
              Your progress <span className="text-xs">▼</span>
            </button>

            <div className="absolute right-0 mt-2 bg-slate-800 border border-gray-700 
                            rounded-lg p-3 w-40 hidden group-hover:block">
              <p className="text-xs text-gray-300">
                {course.completed_lessons} of {course.total_lessons} complete
              </p>
            </div>
          </div>

          {/* CIRCLE PROGRESS BAR */}
          <ProgressCircle
            completed={course.completed_lessons}
            total={course.total_lessons}
          />
        </div>

        {/* RATING */}
        <button
          onClick={() => setShowRatingModal(true)}
          className="text-gray-300 text-sm hover:text-white"
        >
          ★ {course.rating || 4.8}
        </button>
      </div>
    </div>

    {/* ================= MAIN CONTENT ================= */}
    <div className="flex flex-1">

      {/* VIDEO PLAYER */}
      <div className="flex-1 bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-black">
          <video
            key={currentLesson.video_url}
            controls
            autoPlay
            onEnded={handleVideoEnd}
            className="w-full h-full object-contain"
            src={currentLesson.video_url}
          />
        </div>

        <div className="p-4 bg-slate-800 text-sm border-t border-gray-700">
          <p className="font-bold mb-1">Now Playing:</p>
          <p className="text-gray-300">{currentLesson.title}</p>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="w-80 bg-slate-900 border-l border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h4 className="font-bold">Course Content</h4>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {Array.isArray(lessons) &&
            lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => setCurrentLesson(lesson)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition 
                ${
                  currentLesson.id === lesson.id
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

    {/* ================= BOTTOM INFO ================= */}
    <div className="p-6 bg-slate-900 border-t border-gray-800 text-gray-200 space-y-4">
      <h2 className="text-xl font-bold">{course.title}</h2>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-yellow-400 font-bold">★ {course.rating}</span>
        <span className="text-gray-400">{course.reviews} reviews</span>
        <span className="text-gray-400">{course.students} students</span>
      </div>

      <p className="text-gray-300 leading-relaxed">{course.description}</p>

      <div className="mt-4">
        <p className="text-sm text-gray-400">Instructor</p>
        <p className="font-semibold">{course.instructor}</p>
      </div>
    </div>
  </div>
);
}
