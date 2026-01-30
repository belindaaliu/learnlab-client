import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check } from "lucide-react";

const CourseCard = ({ course }) => {
  return (

    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-lg overflow-visible hover:shadow-xl transition-shadow duration-300">
      
      {/* --- Main Card Content --- */}
      <Link to={`/courses/${course.id}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        
        <div className="p-4 flex flex-col gap-1">
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors h-12">
            {course.title}
          </h3>
          <p className="text-xs text-gray-500">{course.instructor}</p>
          
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
            <span>{course.rating || 4.8}</span>
            <div className="flex"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
            <span className="text-gray-400 font-normal text-xs">({course.reviews || 120})</span>
          </div>
          
          <div className="font-bold text-gray-900 mt-1">${course.price}</div>
        </div>
      </Link>

      {/* --- HOVER POPUP --- */}
      <div className="hidden lg:group-hover:block absolute top-0 left-0 w-[300px] bg-white shadow-2xl border border-gray-200 p-5 z-50 rounded-lg animate-in fade-in duration-200"
           style={{ 
             transform: 'scale(1.05)',
             minHeight: '100%'
           }}
      >
          <Link to={`/courses/${course.id}`}>
            <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-bold">Bestseller</span>
               <span className="text-green-600 text-xs font-bold">Updated Jan 2026</span>
            </div>
            
            <div className="space-y-2 mb-6">
               <p className="text-xs text-gray-500 font-bold uppercase">What you'll learn</p>
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-2 items-start">
                    <Check className="w-3 h-3 text-gray-700 mt-1 shrink-0" />
                    <span className="text-sm text-gray-600 leading-tight">Create modern web applications using React.</span>
                 </div>
               ))}
            </div>
            
            <div className="flex items-center gap-3">
               <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded text-sm transition flex items-center justify-center gap-2">
                  Add to cart
               </button>
               <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50">
                  <Star className="w-4 h-4 text-gray-600" />
               </button>
            </div>
          </Link>
      </div>

    </div>
  );
};

export default CourseCard;