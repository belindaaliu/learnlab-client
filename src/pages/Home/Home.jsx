// src/pages/Home.jsx
import React from 'react';
import { ArrowRight, PlayCircle } from "lucide-react";
import CourseCard from '../../components/CourseCard';

// Synthetic data for testing (we will get it from the database later)

const DUMMY_COURSES = [
  {
    id: 1,
    title: "Complete React Developer in 2026 (w/ Redux, Hooks, GraphQL)",
    instructor: "Ali Ravanbakhsh",
    rating: 4.8,
    reviews: 120,
    price: 89.99,
    duration: "42h",
    lessons: 250,
    category: "Development",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Financial Analysis & Valuation Masterclass",
    instructor: "Sarah Johnson",
    rating: 4.9,
    reviews: 85,
    price: 129.99,
    duration: "28h",
    lessons: 140,
    category: "Finance",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Modern UI/UX Design Bootcamp",
    instructor: "Mike Smith",
    rating: 4.7,
    reviews: 210,
    price: 69.99,
    duration: "15h",
    lessons: 80,
    category: "Design",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop"
  }
];

const Home = () => {
  return (
    <div className="pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-r from-primary to-purple-800 text-white py-20 lg:py-28 relative overflow-hidden">
        {/* Background Pattern (Optional) */}
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
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" /> Watch Demo
              </button>
            </div>
          </div>
          
          {/* Hero Image / Illustration */}
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

      {/* --- FEATURED COURSES --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
            <p className="text-gray-500">Hand-picked by our experts for you.</p>
          </div>
          <button className="hidden sm:flex text-primary font-bold hover:text-primaryHover items-center gap-1 transition">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DUMMY_COURSES.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <button className="w-full sm:hidden mt-8 py-3 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50">
          View All Courses
        </button>
      </section>

    </div>
  );
};

export default Home;