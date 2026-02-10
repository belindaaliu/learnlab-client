import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import {
  Search,
  ShoppingCart,
  Menu,
  CornerDownLeft,
} from "lucide-react";

import StudentLayout from "./StudentLayout";
import InstructorLayout from "./InstructorLayout";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const showHeaderSearch =
    location.pathname !== "/" && !location.pathname.startsWith("/courses");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  // While auth is hydrating
  if (loading) {
    return null;
  }

  // Authenticated layouts
  if (user) {
    switch (user.role) {
      case "student":
        return (
          <StudentLayout>
            <Outlet />
          </StudentLayout>
        );
      case "instructor":
        return (
          <InstructorLayout>
            <Outlet />
          </InstructorLayout>
        );
      case "admin":
        return (
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        );
      default:
        return <div>Unauthorized</div>;
    }
  }

  // Public layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-textMain font-sans">
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition"
          >
            <img
              src={logo}
              alt="LearnLab Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Search Bar */}
          {showHeaderSearch && (
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-lg mx-8 relative group"
            >
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-12 pr-10 py-3 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <button type="submit" className="hidden" />
              <div className="absolute right-4 top-3.5 pointer-events-none opacity-40">
                <CornerDownLeft className="w-4 h-4 text-gray-500" />
              </div>
            </form>
          )}

          {/* Actions */}
          <div
            className={`flex items-center gap-4 ${
              !showHeaderSearch ? "ml-auto" : ""
            }`}
          >
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {Number(cartCount) > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-6">
              <Link
                to="/pricing"
                className="px-5 py-2.5 text-gray-700 font-medium hover:text-primary transition"
              >
                Plans & Pricing
              </Link>
              <Link
                to="/teach"
                className="px-5 py-2.5 text-gray-700 font-medium hover:text-primary transition"
              >
                Teach on LearnLab
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 text-gray-700 font-medium hover:text-primary transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primaryHover shadow-lg shadow-purple-200 transition transform hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </div>

            <button className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
        {/* your existing footer content */}
      </footer>
    </div>
  );
};

export default MainLayout;

