import React, { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Check, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CourseCard = ({
  course,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  // isPremiumCourse // Removed because it was not used and caused an error.
  isInWishlist = false,
}) => {
  const navigate = useNavigate();
  const { user, userPlan } = useAuth();

  const defaultImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&v=2";

  const instructorName =
    course.instructor ||
    (course.Users
      ? `${course.Users.first_name} ${course.Users.last_name}`
      : "Unknown Instructor");

  // --- 1. PARSING DYNAMIC DATA (Fixes) ---
  
  const requirementsList = useMemo(() => {
    if (!course.requirements) return [];
    try {
      return Array.isArray(course.requirements) 
        ? course.requirements 
        : JSON.parse(course.requirements);
    } catch {

      return [];
    }
  }, [course.requirements]);

  const updatedDate = useMemo(() => {
    if (course.updated_at) {
      return new Date(course.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return null;
  }, [course.updated_at]);

  // ------------------------------------------

  // Dynamic pricing
  const basePrice = Number(course.price || 0);

  const hasDiscount =
    course.discount_active &&
    course.discount_type &&
    course.discount_value != null &&
    (!course.discount_starts_at ||
      new Date(course.discount_starts_at) <= new Date()) &&
    (!course.discount_ends_at ||
      new Date(course.discount_ends_at) >= new Date());

  let finalPrice = basePrice;
  let discountPercent = 0;

  if (hasDiscount) {
    if (course.discount_type === "percent") {
      discountPercent = Number(course.discount_value);
      finalPrice = Number((basePrice * (1 - discountPercent / 100)).toFixed(2));
    } else if (course.discount_type === "fixed") {
      const discountValue = Number(course.discount_value);
      finalPrice = Math.max(0, Number((basePrice - discountValue).toFixed(2)));
      discountPercent =
        basePrice > 0
          ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
          : 0;
    }
  }

  // --- PLAN / FEATURES ---
  const rawFeatures = userPlan?.features;

  let features = {};
  try {
    features =
      typeof rawFeatures === "string"
        ? JSON.parse(rawFeatures)
        : rawFeatures || {};
  } catch {
    features = {};
  }

  const userPlanName = String(userPlan?.plan_name || userPlan?.planName || "")
    .trim()
    .toLowerCase();

  const coursePlanName = String(
    course?.SubscriptionPlans?.name || course?.required_plan_name || "",
  )
    .trim()
    .toLowerCase();

  const userPlanMatchesCourse =
    !!userPlanName && !!coursePlanName && userPlanName === coursePlanName;

  const hasAllCoursesAccess = features?.all_courses_access === true;

  // --- IDENTITY LOGIC ---
  const isActuallyFree = Number(course.price) === 0;
  

  const isActuallyPremium = Boolean(
    course.is_premium ||
    course.is_subscriber_only ||
    course.isPremium ||
    Number(course.price) > 0,
  );

  // --- ACCESS LOGIC ---
  const userHasAccess = !!(
    isActuallyFree ||
    (user &&
      userPlan?.hasActiveSubscription === true &&
      (hasAllCoursesAccess || userPlanMatchesCourse))
  );

  // --- BADGE LOGIC ---
  const showFreeBadge = isActuallyFree;
  const hasPlan = Boolean(course.plan_id) || Boolean(course.SubscriptionPlans);
  const showPremiumBadge = isActuallyPremium && !isActuallyFree && hasPlan;

  const handleAction = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (userHasAccess) {
      navigate(`/course/${course.id}/learn`);
    } else {
      if (typeof onAddToCart === "function") {
        onAddToCart();
      } else {
        console.error("onAddToCart prop was not passed to CourseCard");
      }
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist && typeof onRemoveFromWishlist === "function") {
      onRemoveFromWishlist();
    } else if (typeof onAddToWishlist === "function") {
      onAddToWishlist();
    }
  };

  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-lg overflow-visible hover:shadow-xl transition-shadow duration-300 h-full">
      <Link to={`/courses/${course.id}`} className="block h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-100">
          <img
            src={course.image || course.thumbnail_url || defaultImage}
            alt={course.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="p-4 flex flex-col gap-1 flex-1">
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors h-10 mb-1">
            {course.title}
          </h3>
          <p className="text-xs text-gray-500">{instructorName}</p>

          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
            <span>{course.rating || 4.8}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-gray-400 font-normal text-xs">
              ({course.reviews || 120})
            </span>
          </div>

          <div className="mt-auto pt-2">
            {userHasAccess ? (
              <div className="flex items-center gap-2">
                {basePrice > 0 ? (
                  <>
                    <span className="font-bold text-purple-700">Included</span>
                    {hasDiscount ? (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          ${basePrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 line-through">
                        ${basePrice.toFixed(2)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-bold text-green-600">Free</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                {basePrice === 0 ? (
                  <span>Free</span>
                ) : hasDiscount ? (
                  <>
                    <span>${finalPrice.toFixed(2)}</span>
                    <span className="text-sm text-gray-400 line-through">
                      ${basePrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span>${basePrice.toFixed(2)}</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
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

              {(course.is_bestseller || (course.rating && course.rating >= 4.8)) && (
                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded font-bold shrink-0">
                  BESTSELLER
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* --- HOVER POPUP (RIGHT SIDE) --- */}
      <div
        className="hidden md:group-hover:block absolute top-0 left-full ml-3 w-[300px] bg-white shadow-xl border border-gray-200 p-5 z-[999] rounded-lg animate-in fade-in duration-200"
      >
        {/* Arrow pointing to card */}
        <div className="absolute top-8 -left-2 w-4 h-4 bg-white border-l border-b border-gray-200 transform rotate-45"></div>

        <Link to={`/courses/${course.id}`} className="block relative z-10">
          <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
            {course.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {showFreeBadge && (
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold">FREE</span>
            )}
            {showPremiumBadge && (
              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1">
                <Crown size={10} fill="currentColor" /> PREMIUM
              </span>
            )}
            
            {updatedDate && (
              <span className="text-green-600 text-[10px] font-bold shrink-0 flex items-center gap-1">
                 Updated {updatedDate}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-4 line-clamp-3">
             {course.description || "Master this topic with our comprehensive guide."}
          </p>

          <div className="space-y-2 mb-6">
            {requirementsList.length > 0 ? (
                <>
                    <p className="text-xs text-gray-500 font-bold uppercase">What you'll learn</p>
                    {requirementsList.slice(0, 3).map((req, i) => (
                    <div key={i} className="flex gap-2 items-start">
                        <Check className="w-3 h-3 text-gray-700 mt-1 shrink-0" />
                        <span className="text-sm text-gray-600 leading-tight">
                        {req}
                        </span>
                    </div>
                    ))}
                </>
            ) : (
                <div className="flex gap-2 items-start">
                    <Check className="w-3 h-3 text-gray-700 mt-1 shrink-0" />
                    <span className="text-sm text-gray-600 leading-tight">
                        Comprehensive curriculum designed for all levels.
                    </span>
                </div>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3 mt-auto">
          <button
            type="button"
            onClick={handleAction}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors text-sm ${
              userHasAccess
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {userHasAccess ? "Go to Course" : "Add to Cart"}
          </button>
          
          <button 
            onClick={handleWishlist}
            className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Star className={`w-4 h-4 ${isInWishlist ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;