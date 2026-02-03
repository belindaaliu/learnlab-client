import { useState, useEffect } from "react";
import axios from "axios";
import CourseCard from "../../components/CourseCard";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";



export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Get logged‑in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    // Fetch user profile
    axios
      .get(`${API_URL}/student/me/${userId}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch error:", err));

    // Fetch recommended courses
    axios
      .get(`${API_URL}/student/${userId}/recommendations`)
      .then((res) => setRecommended(res.data))
      .catch((err) => console.error("Recommendations fetch error:", err));
  }, [userId]);

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

      {/* RECOMMENDATIONS */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">
          What to learn next
        </h2>
        <p className="text-gray-500 mb-6">Recommended for you</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommended.length > 0 ? (
            recommended.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <p className="text-gray-500">No recommendations yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
