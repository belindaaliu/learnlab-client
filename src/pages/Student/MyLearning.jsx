import { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../../components/CourseCard";


export default function MyLearning() {
  const [activeTab, setActiveTab] = useState("courses");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Logged‑in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab"); // "wishlist" | null

    useEffect(() => {
    // If URL has ?tab=wishlist, activate wishlist tab
    if (tabFromUrl === "wishlist") {
        setActiveTab("wishlist");
    } else {
        setActiveTab("courses");
    }
    }, [tabFromUrl]);


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

  const getProgressPercent = (course) => {
  if (!course.total_lessons || course.total_lessons === 0) return 0;

  return Math.round(
    (course.completed_lessons / course.total_lessons) * 100
  );
};


  return (
    <div className="max-w-7xl mx-auto">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-6">My learning</h1>

      {/* TOP BAR: TABS + SEARCH */}
      <div className="flex items-center justify-between border-b pb-3 mb-6">

        {/* TABS */}
        <div className="flex items-center gap-6 text-sm font-medium">
        <button
        onClick={() => {
            setActiveTab("courses");
            setSearchParams({ tab: "courses" });
        }}
        className={`pb-2 ${
            activeTab === "courses"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-600 hover:text-primary"
        }`}
        >
        My Courses
        </button>

        <button
        onClick={() => {
            setActiveTab("wishlist");
            setSearchParams({ tab: "wishlist" });
        }}
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
      <div className="mt-6">

        {/* --- WISHLIST USES COURSE CARD --- */}
        {activeTab === "wishlist" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id} className="transform scale-[0.90] origin-top-left">
                  <CourseCard course={course} />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No courses found in wishlist.</p>
            )}
          </div>
        )}


        {/* --- MY COURSES USES ORIGINAL LIST LAYOUT --- */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const percent = getProgressPercent(course);
                const started = percent > 0;

                return (
                  <div
                    key={course.id}
                    className="flex flex-col bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex gap-6">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-40 h-28 object-cover rounded-md"
                      />

                      <div className="flex flex-col flex-1">
                        <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.instructor}</p>

                        {/* This spacer forces the bottom row to stay fixed */}
                        <div className="flex-1" />

                        {/* BOTTOM ROW: PROGRESS + LINK */}
                        <div className="flex items-center justify-between mt-4">

                          {/* PROGRESS BAR */}
                          <div className="flex-1 mr-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{percent}%</div>
                          </div>

                          {/* START / CONTINUE LINK */}
                          <a
                            href={`/course/${course.id}/learn`}
                            className="text-primary font-semibold text-sm whitespace-nowrap hover:underline"
                          >
                            {started ? "Continue Learning" : "Start Course"}
                          </a>

                        </div>
                      </div>
                    </div>
                  </div>

                );
              })
            ) : (
              <p className="text-gray-500">No courses found.</p>
            )}
          </div>
        )}

      </div>


    </div>
  );
}
