import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, DollarSign, BookOpen, Eye, ArrowUpRight, Loader2, 
  X, Lightbulb, MessageCircle, Image, Video 
} from 'lucide-react';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  
  const [showGuide, setShowGuide] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/courses/instructor/stats`, config);
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-purple-600">
        <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Here is what’s happening with your courses today.</p>
        </div>
        <Link to="/instructor/courses/create" className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-purple-700 transition shadow-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4"/> Create New Course
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<DollarSign className="w-6 h-6 text-green-600"/>} 
          label="Total Revenue" 
          value={`$${(stats.totalRevenue * 0.8).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          bg="bg-green-50"
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-blue-600"/>} 
          label="Total Students" 
          value={stats.totalStudents} 
          bg="bg-blue-50"
        />
        <StatCard 
          icon={<BookOpen className="w-6 h-6 text-purple-600"/>} 
          label="Active Courses" 
          value={stats.totalCourses} 
          bg="bg-purple-50"
        />
        <StatCard 
          icon={<Eye className="w-6 h-6 text-orange-600"/>} 
          label="Total Course Views" 
          value={stats.totalViews} 
          bg="bg-orange-50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Action Area */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
            <ArrowUpRight className="w-5 h-5 text-gray-400"/> 
            {stats.totalCourses > 0 ? "Manage Your Content" : "Get Started"}
          </h3>
          
          {stats.totalCourses > 0 ? (
            <div className="text-gray-600">
              <p className="mb-6 leading-relaxed">
                You currently have <strong className="text-gray-900">{stats.totalCourses} courses</strong> active on the platform. 
                Keep updating your content to engage more students.
              </p>
              <div className="flex gap-4">
                  <Link to="/instructor/courses" className="text-purple-600 font-bold hover:underline bg-purple-50 px-4 py-2 rounded-lg">
                    View My Courses
                  </Link>
                  <Link to="/instructor/performance" className="text-gray-600 font-bold hover:underline bg-gray-50 px-4 py-2 rounded-lg">
                    View Analytics
                  </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
              <Link to="/instructor/courses/create" className="text-purple-600 font-bold hover:underline">
                Create your first course now &rarr;
              </Link>
            </div>
          )}
        </div>


        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">

          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400"/> Instructor Tips
            </h3>
            <ul className="text-slate-300 text-sm space-y-4">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 shrink-0"></span>
                  <span>Engage with student questions quickly to boost ratings.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 shrink-0"></span>
                  <span>Update course thumbnails for better Click-Through Rate (CTR).</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 shrink-0"></span>
                  <span>Add a preview video to increase sales conversion.</span>
                </li>
            </ul>
          </div>
          
          {/* Modal open button */}
          <button 
            onClick={() => setShowGuide(true)}
            className="relative z-10 mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-medium border border-white/10"
          >
            View Instructor Guide
          </button>
        </div>

      </div>

      {/* MODAL: Instructor Guide */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6"/> Instructor Success Guide
              </h2>
              <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-white/20 rounded-full transition">
                <X className="w-6 h-6"/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              
              {/* Tip 1 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6"/>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">Engage Quickly with Students</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Responsiveness is key to building a community. Try to answer Q&A questions within <strong>24 hours</strong>. 
                    Students who feel heard are more likely to leave 5-star reviews and recommend your course to others.
                  </p>
                </div>
              </div>

              {/* Tip 2 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Image className="w-6 h-6"/>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">Optimize Your Thumbnails</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your thumbnail is your "book cover". A high-quality thumbnail can increase traffic by <strong>30%</strong>. 
                    Use contrasting colors, minimal text (less than 5 words), and if possible, include a clear image of your face to build trust.
                  </p>
                </div>
              </div>

              {/* Tip 3 */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6"/>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">The Power of Preview Videos</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Students want to know your teaching style before they buy. Ensure your course has a <strong>2-minute promotional video</strong> 
                    that is free to watch. Highlight what they will build or learn, not just the theory.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowGuide(false)}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Got it, Thanks!
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Simple reusable card component
const StatCard = ({ icon, label, value, bg }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
    </div>
  </div>
);

export default InstructorDashboard;