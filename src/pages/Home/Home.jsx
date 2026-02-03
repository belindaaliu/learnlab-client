import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlayCircle, Search, Loader2 } from "lucide-react";
import CourseCard from '../../components/CourseCard';
import api from '../../utils/Api';

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA ---
  // useEffect(() => {
  //   const fetchFeaturedCourses = async () => {
  //     try {
  //       const response = await fetch('http://localhost:5001/api/courses');
  //       const data = await response.json();
        
  //       // We are currently only displaying the first 3 lessons as "special".
  //       setFeaturedCourses(data.slice(0, 3));
  //     } catch (error) {
  //       console.error("Failed to fetch courses:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchFeaturedCourses();
  // }, []);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await api.get('/courses');
        
        const courseData = response.data.data || response.data;
        
        setFeaturedCourses(courseData.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // --- HANDLERS ---
  const handleSearch = (e) => {
    e.preventDefault(); 
    if (searchQuery.trim()) {

      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const goToCourses = () => {
    navigate('/courses');
  };

  return (
    <div className="pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-r from-primary to-purple-800 text-white py-20 lg:py-28 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-bottom-left"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block py-1 px-3 bg-white/20 rounded-full text-xs font-bold tracking-wide mb-6">
              🚀 NEW: AI Courses Added
            </span>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Unlock Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Potential</span> Today
            </h1>
            <p className="text-lg text-purple-100 mb-8 max-w-lg leading-relaxed">
              Join millions of learners. Master the skills that matter with industry-leading courses in Tech, Business, and more.
            </p>

            {/* --- SEARCH BAR (NEW) --- */}
            <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl flex items-center border border-white/20 mb-8 max-w-lg shadow-lg">
              <Search className="text-purple-200 w-6 h-6 ml-3" />
              <input 
                type="text" 
                placeholder="What do you want to learn?" 
                className="bg-transparent border-none outline-none text-white placeholder-purple-200 flex-1 px-4 py-2 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-white text-primary px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition">
                Search
              </button>
            </form>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={goToCourses} className="px-8 py-4 bg-yellow-400 text-primary rounded-xl font-bold text-lg hover:bg-yellow-300 transition shadow-lg flex items-center justify-center gap-2">
                Explore All Courses <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="hidden lg:block relative">
             <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full"></div>
             <img 
               src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" 
               alt="Student Learning" 
               className="relative rounded-3xl shadow-2xl border-4 border-white/10 transform rotate-3 hover:rotate-0 transition duration-500"
             />
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between gap-8 text-center md:text-left">
          {[
            { label: "Active Students", value: "12,000+" },
            { label: "Quality Courses", value: "850+" },
            { label: "Expert Instructors", value: "120+" },
            { label: "Satisfaction", value: "4.9/5" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-3xl font-extrabold text-gray-800">{stat.value}</span>
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURED COURSES (REAL DATA) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
            <p className="text-gray-500">Hand-picked by our experts for you.</p>
          </div>
          <button onClick={goToCourses} className="hidden sm:flex text-primary font-bold hover:text-primaryHover items-center gap-1 transition">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of Cards */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.length > 0 ? (
              featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500">No courses available at the moment.</p>
            )}
          </div>
        )}

        <button onClick={goToCourses} className="w-full sm:hidden mt-8 py-3 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50">
          View All Courses
        </button>
      </section>

    </div>
  );
};

export default Home;