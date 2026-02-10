import { useState, useEffect } from "react";
import axios from "axios";
import CourseCard from "../../components/CourseCard";
import { Link } from "react-router-dom";
import { addToCart } from "../../services/cartService";
import { toast } from "react-hot-toast";
import { useCart } from "../../context/CartContext";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Get logged‑in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Fetch profile and recommendations
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${API_URL}/student/me/${userId}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch error:", err));

    axios
      .get(`${API_URL}/student/${userId}/recommendations`)
      .then((res) => setRecommended(res.data))
      .catch((err) => console.error("Recommendations fetch error:", err));
  }, [userId]);

  // Handle search
  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      try {
        const res = await axios.get(
          `${API_URL}/courses/search?q=${searchQuery}`,
        );
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      }
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
      <div className="mt-8 max-w-2xl">
        <input
          type="text"
          placeholder="Search for courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full pl-4 pr-4 py-3 rounded-full bg-gray-100 border border-gray-300
                     focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100
                     outline-none transition text-sm"
        />
      </div>

      {/* SEARCH RESULTS */}
      {searchQuery && searchResults.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Search results for "{searchQuery}"
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {searchResults.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onAddToCart={() => handleAddToCart(course.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* NO RESULTS */}
      {searchQuery && searchResults.length === 0 && (
        <p className="text-gray-500 mt-12">
          No courses found for "{searchQuery}".
        </p>
      )}

      {/* DEFAULT — RECOMMENDATIONS */}
      {!searchQuery && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">
            What to learn next
          </h2>
          <p className="text-gray-500 mb-6">Recommended for you</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommended.length > 0 ? (
              recommended.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onAddToCart={() => handleAddToCart(course.id)}
                />
              ))
            ) : (
              <p className="text-gray-500">No recommendations yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
