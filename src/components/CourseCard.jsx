import React from 'react';
import { Star, Clock, BookOpen } from "lucide-react";
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary shadow-sm">
          {course.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
          <Star className="w-3 h-3 fill-current" />
          <span className="font-bold text-gray-700">{course.rating}</span>
          <span className="text-gray-400">({course.reviews})</span>
        </div>

        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-primary transition cursor-pointer">
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </h3>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">by {course.instructor}</p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{course.lessons} lectures</span>
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-primary">${course.price}</span>
          <button className="px-4 py-2 bg-purple-50 text-primary text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;