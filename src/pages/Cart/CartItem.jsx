import React from 'react';
import { Tag } from 'lucide-react';

const CartItem = ({ item, onRemove }) => {
  const course = item.Courses;

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200 items-start">
      {/* Course Image */}
      <img
        src={course.image}
        alt={course.title}
        className="w-full sm:w-32 h-20 object-cover rounded-sm border border-gray-100"
      />

      {/* Course Info */}
      <div className="flex-grow">
        <h3 className="font-bold text-gray-900 text-md leading-tight mb-1">{course.title}</h3>
        <p className="text-xs text-gray-600 mb-1">By {course.instructor}</p>
        
        {/* Badges/Rating placeholder to match UI */}
        <div className="flex items-center gap-2 mb-2">
           <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded">Bestseller</span>
           <span className="text-yellow-600 font-bold text-xs">4.7 ★★★★★</span>
           <span className="text-gray-400 text-xs">(278,657 ratings)</span>
        </div>

        <div className="flex gap-4 text-sm font-medium">
          <button onClick={() => onRemove(item.id)} className="text-purple-600 hover:text-purple-800 underline underline-offset-4">Remove</button>
          <button className="text-purple-600 hover:text-purple-800 underline underline-offset-4">Save for Later</button>
          <button className="text-purple-600 hover:text-purple-800 underline underline-offset-4">Move to Wishlist</button>
        </div>
      </div>

      {/* Price Section */}
      <div className="flex flex-col items-end min-w-[100px]">
        <span className="text-purple-700 font-bold text-lg flex items-center gap-1">
          CA${course.price} <Tag className="w-4 h-4" />
        </span>
        <span className="text-gray-400 line-through text-sm">CA${(course.price * 1.85).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartItem;