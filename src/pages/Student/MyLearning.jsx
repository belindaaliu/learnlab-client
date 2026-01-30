import { useState } from "react";
import { Search } from "lucide-react";

export default function MyLearning() {
    // const user = JSON.parse(localStorage.getItem("user")); 
    // const userId = user?.id;
  const [activeTab, setActiveTab] = useState("courses");
//   const [purchasedCourses, setPurchasedCourses] = useState([]); 
//   const [wishlistCourses, setWishlistCourses] = useState([]);
// const [searchTerm, setSearchTerm] = useState("");


  // MOCK DATA
  const purchasedCourses = [
    {
      id: 1,
      title: "100 Days of Code: The Complete Python Pro Bootcamp",
      instructor: "Dr. Angela Yu",
      rating: 4.7,
      reviews: 410498,
      hours: "56.5",
      lectures: 598,
      price: 18.99,
      oldPrice: 140.99,
      badge: "Bestseller",
      thumbnail: "https://img-c.udemycdn.com/course/240x135/567828_67d0.jpg"
    },
    {
      id: 2,
      title: "React – The Complete Guide 2025",
      instructor: "Maximilian Schwarzmüller",
      rating: 4.8,
      reviews: 210000,
      hours: "48",
      lectures: 540,
      price: 19.99,
      oldPrice: 129.99,
      badge: "Highest Rated",
      thumbnail: "https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg"
    }
  ];

  const wishlistCourses = [
    {
      id: 3,
      title: "Node.js API Mastery",
      instructor: "Sarah Lee",
      rating: 4.7,
      reviews: 9000,
      hours: "22",
      lectures: 180,
      price: 14.99,
      oldPrice: 99.99,
      badge: "Hot & New",
      thumbnail: "https://img-c.udemycdn.com/course/240x135/2195280_49b2_3.jpg"
    },
    {
      id: 4,
      title: "Advanced React Patterns",
      instructor: "John Doe",
      rating: 4.8,
      reviews: 12000,
      hours: "18",
      lectures: 95,
      price: 17.99,
      oldPrice: 89.99,
      badge: "Bestseller",
      thumbnail: "https://img-c.udemycdn.com/course/240x135/1565838_e54e_12.jpg"
    }
  ];

// useEffect(() => {
//   fetch(`http://localhost:5000/api/student/${userId}/courses`)
//     .then(res => res.json())
//     .then(data => setPurchasedCourses(data));
//      .catch((err) => console.error("Error fetching purchased:", err));

//   fetch(`http://localhost:5000/api/student/${userId}/wishlist`)
//     .then(res => res.json())
//      .then(data => setWishlistCourses(data));
//      .catch((err) => console.error("Error fetching wishlist:", err));
// }, []);

    // Choose which tab’s data to show
     const coursesToShow =
        activeTab === "courses" ? purchasedCourses : wishlistCourses;

    // Filtering logic  
    // const filteredCourses = coursesToShow.filter(course => 
    //     course.title.toLowerCase().includes(searchTerm.toLowerCase()) 
    // );

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

        {/* SEARCH MY COURSES */}
        <div className="relative max-w-xs">
          <input
            type="text"
            placeholder="Search my courses"
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 
                        focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100 
                        outline-none transition text-sm"
            />

          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* COURSE LIST */}
      <div className="space-y-6">
        {coursesToShow.map((course) => (
          <div
            key={course.id}
            className="flex gap-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <img
              src={course.thumbnail}
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
                  ({course.reviews.toLocaleString()})
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {course.hours} total hours · {course.lectures} lectures
              </p>

              {course.badge && (
                <span className="inline-block mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  {course.badge}
                </span>
              )}
            </div>

            <div className="text-right">
              <p className="text-lg font-bold">CA${course.price}</p>
              <p className="text-sm line-through text-gray-500">
                CA${course.oldPrice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
