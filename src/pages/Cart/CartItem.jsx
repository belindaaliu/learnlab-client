import React from "react";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

const CartItem = ({ item, onRemove }) => {
  const course = item.course || item;
  const courseId = course.id || item.course_id;
  const itemIdToRemove = item.id;

  // Price Section
  const originalPrice = course.original_price ?? course.price;
  const finalPrice = course.price; 
  const hasDiscount = originalPrice > finalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const instructorId =
    course.instructor_id || course.Users?.id || course.user_id;
  const instructorName =
    course.instructor_name ||
    (course.Users
      ? `${course.Users.first_name} ${course.Users.last_name}`
      : "Instructor");

  // BADGE LOGIC
  const isActuallyFree = Number(course.price) === 0;
  const isActuallyPremium = Boolean(
    course.is_premium ||
    course.is_subscriber_only ||
    course.isPremium ||
    Number(course.price) > 0,
  );
  const showFreeBadge = isActuallyFree;
  const showPremiumBadge = isActuallyPremium && !isActuallyFree;
  const showBestsellerBadge =
    course.is_bestseller || (course.rating && course.rating >= 4.8);

  return (
    <div className="flex flex-col md:flex-row gap-4 py-6 border-b border-gray-200 items-start group">
      {/* Course Image */}
      <Link to={`/course/${courseId}`} className="relative shrink-0 block">
        <img
          src={
            course.image ||
            course.thumbnail ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={course.title}
          className="w-full md:w-32 h-20 object-cover rounded-sm border border-gray-100 hover:opacity-90 transition"
        />
      </Link>

      {/* Course Info */}
      <div className="flex-grow space-y-1">
        <Link to={`/courses/${courseId}`}>
          <h3 className="font-bold text-gray-900 text-[16px] leading-tight hover:text-purple-700 cursor-pointer transition-colors">
            {course.title}
          </h3>
        </Link>

        {/* INSTRUCTOR  */}
        <p className="text-xs text-gray-600">
          By{" "}
          <Link
            to={`/profile/${instructorId}`}
            className="text-primary hover:text-indigo-800 underline transition-colors"
          >
            {instructorName}
          </Link>
        </p>

        {/* BADGES ROW */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showFreeBadge && (
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold shrink-0">
              FREE
            </span>
          )}

          {showPremiumBadge && (
            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 shrink-0">
              <Crown size={10} fill="currentColor" /> PREMIUM
            </span>
          )}

          {showBestsellerBadge && (
            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded font-bold shrink-0">
              BESTSELLER
            </span>
          )}
        </div>

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
            Move to Wishlist
          </button>
        </div>
      </div>

      {/* Price Section */}
      <div className="flex flex-col items-end min-w-[120px]">
        <div className="text-primary font-bold text-lg">
          CA${Number(finalPrice).toFixed(2)}
        </div>

        {hasDiscount && (
          <>
            <div className="text-gray-400 line-through text-sm">
              CA${Number(originalPrice).toFixed(2)}
            </div>
            <div className="text-gray-700 text-xs mt-1 italic font-medium">
              {discountPercent}% off
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartItem;
