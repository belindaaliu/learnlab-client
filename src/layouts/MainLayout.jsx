import { Outlet, Link } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-textMain font-sans">
      {/* --- HEADER --- */}
      <header className="bg-surface sticky top-0 z-50 border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 lg:px-8">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          🎓 LearnLab
        </Link>

        {/* Auth Buttons */}
        <div className="flex gap-3">
          <Link to="/auth/login" className="px-4 py-2 text-primary font-medium hover:bg-purple-50 rounded-lg transition">
            Log in
          </Link>
          <Link to="/auth/register" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primaryHover shadow-md transition">
            Sign up
          </Link>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="flex-grow">
        {/* Contents of other pages go here */}
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        <p>© 2026 LearnLab. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;