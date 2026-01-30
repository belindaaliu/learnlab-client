// src/layouts/MainLayout.jsx
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/images/logo.png';
import { Search, ShoppingCart, Menu, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, CornerDownLeft } from "lucide-react";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const showHeaderSearch = location.pathname !== '/' && !location.pathname.startsWith('/courses');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-textMain font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <img 
              src={logo} 
              alt="LearnLab Logo" 
              className="h-12 w-auto object-contain" 
            />
          </Link>

          {/* Search Bar (Conditional) */}
          {showHeaderSearch && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
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
          <div className={`flex items-center gap-4 ${!showHeaderSearch ? 'ml-auto' : ''}`}>
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary transition">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">0</span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/pricing" className="px-5 py-2.5 text-gray-700 font-medium hover:text-primary transition" > Plans & Pricing </Link> 
              <Link to="/teach" className="px-5 py-2.5 text-gray-700 font-medium hover:text-primary transition" > Teach on LearnLab </Link>
              <Link to="/login" className="px-5 py-2.5 text-gray-700 font-medium hover:text-primary transition">Log in</Link>
              <Link to="/register" className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primaryHover shadow-lg shadow-purple-200 transition transform hover:-translate-y-0.5">Sign up</Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- PAGE CONTENT --- */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1 */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              🎓 LearnLab
            </h3>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              Empowering learners worldwide.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-primary hover:text-white transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {['About Us', 'All Courses', 'Become an Instructor', 'Pricing Plans', 'FAQ'].map(link => (
                <li key={link}><Link to="#" className="hover:text-primary transition">{link}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              {['Help Center', 'Terms of Service', 'Privacy Policy', 'Contact Support'].map(link => (
                <li key={link}><Link to="#" className="hover:text-primary transition">{link}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Montreal, QC, Canada</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+1 (514) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>hello@learnlab.ca</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          <p>© 2026 LearnLab LMS.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;