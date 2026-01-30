import { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";

export default function MyLearning() {
  const [activeTab, setActiveTab] = useState("courses");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Logged‑in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    // Fetch purchased courses
    axios
      .get(`${API_URL}/student/${userId}/courses`)
      .then((res) => setPurchasedCourses(res.data))
      .catch((err) => console.error("Error fetching purchased:", err));

    // Fetch wishlist courses
    axios
      .get(`${API_URL}/student/${userId}/wishlist`)
      .then((res) => setWishlistCourses(res.data))
      .catch((err) => console.error("Error fetching wishlist:", err));
  }, [userId]);

  // Choose which tab’s data to show
  const coursesToShow =
    activeTab === "courses" ? purchasedCourses : wishlistCourses;

  // Optional search filter
  const filteredCourses = coursesToShow.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-6">My learning</h1>

      {/* TOP BAR: TABS + SEARCH */}
      <div className="flex items-center justify-between border-b pb-3 mb-6">

        {/* TABS */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-2 ${
              activeTab === "courses"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            My Courses
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-2 ${
              activeTab === "wishlist"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Wishlist
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-xs">
          <input
            type="text"
            placeholder="Search my courses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 
                       focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100 
                       outline-none transition text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* COURSE LIST */}
      <div className="space-y-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex gap-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-48 h-28 object-cover rounded-md"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.instructor}</p>

                <p className="text-sm text-gray-500 mt-1">
                  {course.hours || "—"} total hours ·{" "}
                  {course.lectures || "—"} lectures
                </p>

                {course.badge && (
                  <span className="inline-block mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                    {course.badge}
                  </span>
                )}
              </div>

              <div className="text-right">
                {course.price && (
                  <>
                    <p className="text-lg font-bold">CA${course.price}</p>
                    {course.oldPrice && (
                      <p className="text-sm line-through text-gray-500">
                        CA${course.oldPrice}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No courses found.</p>
        )}
      </div>
    </div>
  );
}
