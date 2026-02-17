import React from "react";
import { Link } from "react-router-dom";
import { Crown, Star } from "lucide-react";

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

  // Rating data
  const rating = course.rating || 0;
  const totalReviews = course.reviews || course.total_reviews || 0;
  const hasRating = rating > 0;

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

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-[#b4690e] text-[#b4690e]" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3 h-3">
            <Star className="w-3 h-3 text-[#b4690e]" />
            <Star className="w-3 h-3 fill-[#b4690e] text-[#b4690e] absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-[#b4690e]" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 py-6 border-b border-gray-200 items-start group">
      {/* Course Image */}
      <Link to={`/course/${courseId}`} className="relative shrink-0 block">
        <img
          src={
            course.image ||
            course.thumbnail ||
            course.thumbnail_url ||
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

        {/* Rating */}
        {hasRating ? (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[#b4690e] font-bold text-sm">
              {rating.toFixed(1)}
            </span>
            <div className="flex gap-0.5">
              {renderStars(rating)}
            </div>
            <span className="text-gray-400 text-xs">
              ({totalReviews.toLocaleString()} {totalReviews === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-gray-400 text-xs">No ratings yet</span>
          </div>
        )}

        {/* Action Links */}
        <div className="flex flex-wrap gap-4 pt-3 text-sm font-medium">
          <button
            onClick={() => onRemove(itemIdToRemove)}
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