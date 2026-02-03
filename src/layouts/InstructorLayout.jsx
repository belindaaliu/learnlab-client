import { useState, useEffect } from "react";
import axios from "axios";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Bell, MessageSquare, BarChart, BookOpen, LogOut, User } from "lucide-react";
import logo from "../assets/images/logo.png";

export default function InstructorLayout() {
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
    // We are currently using the same endpoint profile.
    axios
      .get(`${API_URL}/student/me/${userId}`) 
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch error:", err));
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* ---------------- INSTRUCTOR NAVBAR ---------------- */}
      <header className="bg-slate-900 text-white h-20 shadow-md flex items-center px-6 gap-6">
        
        {/* LEFT — Logo */}
        <div className="flex items-center gap-8 shrink-0">
          <Link to="/instructor/dashboard">
             {/* Display the logo on a light dark background.*/}
             <div className="flex items-center gap-2">
                <img src={logo} alt="LearnLab" className="h-8 w-auto object-contain brightness-0 invert" />
                <span className="text-xs font-bold bg-purple-600 px-2 py-0.5 rounded uppercase tracking-wider">Instructor</span>
             </div>
          </Link>

          {/* Instructor Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link to="/instructor/courses" className="hover:text-white transition flex items-center gap-2">
                <BookOpen className="w-4 h-4"/> Courses
            </Link>
            <Link to="/instructor/communication" className="hover:text-white transition flex items-center gap-2">
                <MessageSquare className="w-4 h-4"/> Communication
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

          {/* Switch to Student View */}
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
            {/* 1. Profile photo (Trigger) */}
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-purple-500 transition-colors"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-2 border-slate-700 group-hover:border-purple-400 transition-colors">
                {profile?.first_name?.[0]}
              </div>
            )}

            <div className="absolute right-0 top-full pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                
                {/* 3. Original white box */}
                <div className="bg-white text-gray-800 shadow-xl rounded-lg border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gray-50">
                        <p className="font-bold text-sm truncate">{profile?.first_name} {profile?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="py-1">
                        <Link to="/instructor/profile" className="block px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition">
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

      {/* ---------------- PAGE CONTENT ---------------- */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}