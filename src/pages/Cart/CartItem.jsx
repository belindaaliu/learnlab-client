import React from "react";

const CartItem = ({ item, onRemove }) => {
  const { course } = item;

  return (
    <div className="flex flex-col md:flex-row gap-4 py-6 border-b border-gray-200 items-start group">
      {/* Course Image */}
      <div className="relative shrink-0">
        <img
          src={
            course.image || "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={course.title}
          className="w-full md:w-32 h-20 object-cover rounded-sm border border-gray-100"
        />
      </div>

      {/* Course Info */}
      <div className="flex-grow space-y-1">
        <h3 className="font-bold text-gray-900 text-[16px] leading-tight hover:text-primary cursor-pointer transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-gray-600">
          By{" "}
          <span className="hover:text-gray-900 cursor-pointer underline decoration-gray-400">
            {course.instructor_name}
          </span>
        </p>

        {/* Udemy Style Rating Placeholder */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[#b4690e] font-bold text-sm">4.6</span>
          <div className="flex text-[#b4690e] text-xs">★★★★★</div>
          <span className="text-gray-400 text-xs">(12,450 ratings)</span>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap gap-4 pt-3 text-sm font-medium">
          <button
            onClick={() => onRemove(item.id)}
            className="text-primary hover:text-indigo-800 transition-colors"
          >
            Remove
          </button>
          <button className="text-primary hover:text-indigo-800 transition-colors">
            Save for Later
          </button>
          <button className="text-primary hover:text-indigo-800 transition-colors">
            Move to Wishlist
          </button>
        </div>
      </div>

      {/* Price Section */}
      <div className="flex flex-col items-end min-w-[120px]">
        <div className="text-primary font-bold text-lg">
          CA${Number(course.price).toFixed(2)}
        </div>
        <div className="text-gray-400 line-through text-sm">
          CA${(Number(course.price) * 5.5).toFixed(2)}
        </div>
        <div className="text-gray-700 text-xs mt-1 italic font-medium">
          Price includes discount
        </div>
      </div>
    </div>
  );
};

export default CartItem;
