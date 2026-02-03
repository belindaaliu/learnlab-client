import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

export default function PublicProfile() {
  const { id } = useParams(); // /student/public-profile/:id
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("learning");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!id) return;

    // Fetch student profile
    axios
      .get(`${API_URL}/student/me/${id}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch error:", err));

    // Fetch purchased courses
    axios
      .get(`${API_URL}/student/${id}/courses`)
      .then((res) => setPurchasedCourses(res.data))
      .catch((err) => console.error("Purchased fetch error:", err));

    // Fetch wishlist courses
    axios
      .get(`${API_URL}/student/${id}/wishlist`)
      .then((res) => setWishlistCourses(res.data))
      .catch((err) => console.error("Wishlist fetch error:", err));
  }, [id]);

  const coursesToShow =
    activeTab === "learning" ? purchasedCourses : wishlistCourses;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">

      {/* LEFT SIDEBAR */}
      <div className="bg-white shadow-sm border rounded-xl p-6 h-fit sticky top-10">

        {/* ROLE LABEL */}
        <p className="text-xs font-semibold text-gray-500 tracking-widest">
          LEARNER
        </p>

        {/* AVATAR */}
       <div className="w-20 h-20 rounded-full overflow-hidden mt-4">
        {profile?.photo_url ? (
          <img
            src={profile.photo_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
            {profile?.first_name?.[0]}
          </div>
        )}
      </div>

        {/* NAME */}
        <h2 className="text-xl font-bold mt-4">
          {profile?.first_name} {profile?.last_name}
        </h2>

        {/* OCCUPATION */}
        <p className="text-gray-600 mt-1">
          {profile?.occupation || "Learner"}
        </p>

        {/* EDIT PROFILE BUTTON */}
        <Link
          to="/student/edit-profile"
          className="mt-6 inline-block bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          Edit profile
        </Link>
      </div>

      {/* RIGHT CONTENT */}
      <div className="lg:col-span-3">

        {/* TABS */}
        <div className="flex items-center gap-8 border-b pb-3 mb-6">
          <button
            onClick={() => setActiveTab("learning")}
            className={`pb-2 text-sm font-semibold ${
              activeTab === "learning"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Learning
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-2 text-sm font-semibold ${
              activeTab === "wishlist"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Wishlist
          </button>
        </div>

        {/* COURSE LIST */}
        <div className="space-y-6">
          {coursesToShow.length === 0 ? (
            <p className="text-gray-500">No courses found.</p>
          ) : (
            coursesToShow.map((course) => (
              <div
                key={course.id}
                className="flex gap-6 bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-48 h-28 object-cover rounded-md"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.instructor}</p>

                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="text-gray-500">
                      ({course.reviews?.toLocaleString()})
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {course.hours || "—"} total hours ·{" "}
                    {course.lectures || "—"} lectures · All Levels
                  </p>
                </div>

                <div className="text-right">
                  <Link
                    to={`/course/${course.id}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    View course
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
