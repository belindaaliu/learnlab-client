import { Link, Outlet } from "react-router-dom";
import { Search, Heart, Bell, ShoppingCart, MessageSquare } from "lucide-react";
import logo from "../assets/images/logo.png";

// TEMP MOCK USER — replace with real auth later
const MOCK_USER = {
  first_name: "Samira",
  last_name: "Panahi",
  avatar_url: null,
  email: "samira.panahi@gmail.com",
};

export default function StudentLayout() {

  const [showLearningMenu, setShowLearningMenu] = useState(false);
  const [showWishlistMenu, setShowWishlistMenu] = useState(false);


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ---------------- TOP NAVBAR ---------------- */}
      <header className="bg-white h-20 border-b border-gray-200 shadow-sm flex items-center px-6 gap-6">

        {/* LEFT — Logo */}
        <div className="flex items-center gap-4 shrink-0">
            <Link to="/student/dashboard">
            <img src={logo} alt="LearnLab Logo" className="h-10 w-auto object-contain" />
            </Link>
        </div>

        {/* CENTER — Search Bar */}
        <div className="hidden md:flex flex-1 max-w-3xl mx-6 relative">
            <input
            type="text"
            placeholder="Search your courses..."
            className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 border-transparent 
                        focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100 
                        outline-none transition text-sm"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>

        {/* RIGHT — Navigation + Icons */}
        <div className="flex items-center gap-6 shrink-0">

            {/* Plans & Pricing */}
            <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-primary transition">
            Plans & Pricing
            </Link>

            {/* Teach */}
            <Link to="/teach" className="text-sm font-medium text-gray-700 hover:text-primary transition">
            Teach on LearnLab
            </Link>

            {/* My Learning */}
            <div className="relative" 
            onMouseEnter={() => setShowLearningMenu(true)} 
            onMouseLeave={() => setShowLearningMenu(false)} 
            >
            <Link
              to="/student/learning"
              className="text-sm font-medium text-gray-700 hover:text-primary transition"
            >
              My Learning
            </Link>

            {/* DROPDOWN */}
            <div className="absolute left-0 mt-2 w-80 bg-white shadow-lg border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              
              {/* COURSE LIST */}
              <div className="p-4 space-y-4">
                {purchasedCourses.slice(0, 3).map(course => (
                  <div key={course.id} className="flex gap-3">
                    <img
                      src={course.thumbnail_url}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{course.title}</p>
                      <Link
                        to={`/course/${course.id}`}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Start learning
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER BUTTON */}
              <div className="border-t p-3">
                <Link
                  to="/student/learning"
                  className="block text-center text-sm font-semibold text-primary hover:underline"
                >
                  Go to My Learning
                </Link>
              </div>
            </div>
          </div>


            {/* Wishlist */}
            <div className="relative" 
            onMouseEnter={() => setShowWishlistMenu(true)} 
            onMouseLeave={() => setShowWishlistMenu(false)} 
            >
            <Link
              to="/student/learning?tab=wishlist"
              className="text-sm font-medium text-gray-700 hover:text-primary transition"
            >
              Wishlist
            </Link>

            <div className="absolute left-0 mt-2 w-80 bg-white shadow-lg border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              
              <div className="p-4 space-y-4">
                {wishlistCourses.slice(0, 3).map(course => (
                  <div key={course.id} className="flex gap-3">
                    <img
                      src={course.thumbnail_url}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{course.title}</p>
                      <Link
                        to={`/course/${course.id}`}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        View course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-3">
                <Link
                  to="/student/learning?tab=wishlist"
                  className="block text-center text-sm font-semibold text-primary hover:underline"
                >
                  Go to Wishlist
                </Link>
              </div>
            </div>
          </div>


            {/* Cart */}
            <Link to="/cart" className="relative text-gray-600 hover:text-primary transition">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] 
                            font-bold w-4 h-4 flex items-center justify-center rounded-full">
                0
            </span>
            </Link>

            {/* Notifications */}
            <Link to="/student/notifications" className="text-gray-600 hover:text-primary transition">
            <Bell className="w-6 h-6" />
            </Link>

            {/* Messages */}
            <Link to="/student/messages" className="text-gray-600 hover:text-primary transition">
            <MessageSquare className="w-6 h-6" />
            </Link>

            {/* Avatar */}
            <div className="relative group cursor-pointer">
            {MOCK_USER.avatar_url ? (
                <img
                src={MOCK_USER.avatar_url}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center 
                                justify-center font-semibold">
                {MOCK_USER.first_name[0]}
                {MOCK_USER.last_name[0]}
                </div>
            )}

            {/* Dropdown */}
            <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-lg opacity-0 
                            group-hover:opacity-100 transition pointer-events-none 
                            group-hover:pointer-events-auto z-50">

                {/* User Info */}
                <div className="px-4 py-3 border-b">
                <p className="font-semibold">{MOCK_USER.first_name} {MOCK_USER.last_name}</p>
                <p className="text-xs text-gray-500">{MOCK_USER.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">

                <Link to="/student/learning" className="block px-4 py-2 hover:bg-gray-100">My learning</Link>
                <Link to="/cart" className="block px-4 py-2 hover:bg-gray-100">My cart</Link>
                <Link to="/student/wishlist" className="block px-4 py-2 hover:bg-gray-100">Wishlist</Link>
                <Link to="/teach" className="block px-4 py-2 hover:bg-gray-100">Teach on LearnLab</Link>

                <div className="border-t my-2"></div>

                <Link to="/student/notifications" className="block px-4 py-2 hover:bg-gray-100">Notifications</Link>
                <Link to="/student/messages" className="block px-4 py-2 hover:bg-gray-100">Messages</Link>

                <div className="border-t my-2"></div>

                <Link to="/student/profile" className="block px-4 py-2 hover:bg-gray-100">Account settings</Link>
                <Link to="/student/subscriptions" className="block px-4 py-2 hover:bg-gray-100">Subscriptions</Link>
                <Link to="/student/purchases" className="block px-4 py-2 hover:bg-gray-100">Purchase history</Link>

                <div className="border-t my-2"></div>

                <Link to="/student/public-profile" className="block px-4 py-2 hover:bg-gray-100">Public profile</Link>
                <Link to="/student/edit-profile" className="block px-4 py-2 hover:bg-gray-100">Edit profile</Link>
                <Link to="/help" className="block px-4 py-2 hover:bg-gray-100">Help & Support</Link>

                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Log out</button>
                </div>

            </div>
            </div>

        </div>
        </header>


      {/* ---------------- PAGE CONTENT ---------------- */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
}
