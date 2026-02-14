import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Bell, MessageSquare, BarChart, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import logo from "../../assets/images/logo.png";

export default function InstructorNavbar() {
  const [profile, setProfile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${API_URL}/student/me/${userId}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch error:", err));
  }, [userId, API_URL]);

  const displayPhoto = profile?.photo_url || user?.photo_url;
  const displayFirstName = profile?.first_name || user?.first_name || "I";
  const displayLastName = profile?.last_name || user?.last_name || "";

  return (
    <header className="bg-slate-900 text-white h-20 shadow-md flex items-center px-6 gap-6 sticky top-0 z-50">
      
      {/* LEFT — Logo & Brand Split Navigation */}
      <div className="flex items-center gap-8 shrink-0">
        
        <div className="flex items-center gap-3">

          <Link to="/" title="Go to Main Site">
             <img src={logo} alt="LearnLab" className="h-8 w-auto object-contain brightness-0 invert hover:opacity-80 transition" />
          </Link>

          <div className="h-6 w-px bg-slate-700 mx-1"></div>

             <span className="text-xs font-bold bg-purple-600 px-2 py-0.5 rounded uppercase tracking-wider group-hover:bg-purple-500 transition">
               Instructor
             </span>
        </div>

        {/* Instructor Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link to="/instructor/dashboard" className="hover:text-white transition flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4"/> Dashboard
          </Link>
          <Link to="/instructor/courses" className="hover:text-white transition flex items-center gap-2">
              <BookOpen className="w-4 h-4"/> Courses
          </Link>
          <Link to="/instructor/messages" className="hover:text-white transition flex items-center gap-2">
              <MessageSquare className="w-4 h-4"/> Messages
          </Link>
          <Link to="/instructor/performance" className="hover:text-white transition flex items-center gap-2">
              <BarChart className="w-4 h-4"/> Performance
          </Link>
        </nav>
      </div>

      {/* SPACER */}
      <div className="flex-1"></div>

      {/* RIGHT — Actions */}
      <div className="flex items-center gap-6 shrink-0">

        {/* Switch to Student View Button */}
        <Link 
          to="/" 
          className="hidden md:block text-xs font-bold text-slate-900 bg-white hover:bg-gray-100 px-4 py-2 rounded-full transition"
        >
          Student View
        </Link>

        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-white transition">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>

        {/* Avatar / Profile Dropdown */}
        <div className="relative group h-full flex items-center cursor-pointer">

          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-purple-500 transition-colors"
              onError={(e) => {

                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div 
            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-2 border-slate-700 group-hover:border-purple-400 transition-colors"
            style={{ display: displayPhoto ? 'none' : 'flex' }}
          >
            {displayFirstName[0].toUpperCase()}
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white text-gray-800 shadow-xl rounded-lg border border-gray-100 overflow-hidden mt-2">
                  <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="font-bold text-sm truncate">{displayFirstName} {displayLastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                      <Link to="/instructor/edit-profile" className="block px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition">
                          Edit Profile
                      </Link>
                      <Link to="/instructor/settings" className="block px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition">
                          Account Settings
                      </Link>
                      <div className="border-t my-1"></div>
                      <button 
                          onClick={handleLogout} 
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition"
                      >
                          <LogOut className="w-4 h-4" /> Log out
                      </button>
                  </div>
              </div>
          </div>
        </div>

      </div>
    </header>
  );
}