import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Check, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CourseCard = ({ course, onAddToCart }) => {
  const navigate = useNavigate();
  const { user, userPlan } = useAuth();

  const defaultImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&v=2";

  const instructorName =
    course.instructor ||
    (course.Users
      ? `${course.Users.first_name} ${course.Users.last_name}`
      : "Unknown Instructor");

  // DATA PARSING
  const activePlan = userPlan?.data || userPlan;
  const rawFeatures = activePlan?.features;

  let features = {};
  try {
    features =
      typeof rawFeatures === "string"
        ? JSON.parse(rawFeatures)
        : rawFeatures || {};
  } catch (e) {
    features = {};
  }

  // LOGIC VARIABLES
  const currentCourseId = String(course.id);

  const subscriberOnlyList = Array.isArray(features?.subscriber_only_courses)
    ? features.subscriber_only_courses.map((id) => String(id))
    : [];

  // IDENTITY LOGIC
  const isActuallyFree = Number(course.price) === 0;
  const isActuallyPremium = Boolean(
    course.is_premium ||
    course.is_subscriber_only ||
    course.isPremium ||
    Number(course.price) > 0,
  );

  // ACCESS LOGIC
  const userHasAccess = !!(
    isActuallyFree ||
    (user &&
      activePlan?.hasActiveSubscription === true &&
      (features?.all_courses_access === true ||
        subscriberOnlyList.includes(currentCourseId)))
  );

  // BADGE LOGIC
  const showFreeBadge = isActuallyFree;
  const showPremiumBadge = isActuallyPremium && !isActuallyFree;

  const handleAction = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (userHasAccess) {
      navigate(`/course/${course.id}/learn`);
    } else {
      onAddToCart();
    }
  };

  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-lg overflow-visible hover:shadow-xl transition-shadow duration-300">
      <Link to={`/courses/${course.id}`} className="block">
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

        <div className="p-4 flex flex-col gap-1">
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors h-12">
            {course.title}
          </h3>
          <p className="text-xs text-gray-500">{instructorName}</p>

          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
            <span>{course.rating || 4.8}</span>
            <div className="flex">
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-gray-400 font-normal text-xs">
              ({course.reviews || 120})
            </span>
          </div>

          <div className="mt-1">
            {userHasAccess ? (
              // Only shows "Included" if the user is logged in AND has an active plan
              <div className="flex items-center gap-2">
                {/* If it's a paid course the user has via sub, show "Included" */}
                {Number(course.price) > 0 ? (
                  <>
                    <span className="font-bold text-purple-700">Included</span>
                    <span className="text-xs text-gray-400 line-through">
                      ${course.price}
                    </span>
                  </>
                ) : (
                  /* If it's just a free course, just show "Free" or the $0 price */
                  <span className="font-bold text-green-600 font-bold">
                    Free
                  </span>
                )}
              </div>
            ) : (
              // Shows price for Guests AND logged-in users without a plan
              <div className="font-bold text-gray-900 mt-1">
                ${course.price}
              </div>
            )}

            {/* BADGE ROW BELOW PRICE */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* FREE BADGE */}
              {showFreeBadge && (
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold shrink-0">
                  FREE
                </span>
              )}

              {/* PREMIUM BADGE */}
              {showPremiumBadge && (
                <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 shrink-0">
                  <Crown size={10} fill="currentColor" /> PREMIUM
                </span>
              )}

              {/* BESTSELLER BADGE */}
              {(course.is_bestseller || course.rating >= 4.8) && (
                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded font-bold shrink-0">
                  BESTSELLER
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* --- HOVER POPUP --- */}
      <div
        className="hidden lg:group-hover:block absolute top-0 left-0 w-[320px] bg-white shadow-2xl border border-gray-200 p-5 z-50 rounded-lg animate-in fade-in duration-200"
        style={{
          transform: "scale(1.05) translateX(10px) translateY(-10px)",
          minHeight: "100%",
        }}
      >
        <Link to={`/courses/${course.id}`} className="block">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            {course.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* FREE BADGE */}
            {showFreeBadge && (
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold shrink-0">
                FREE
              </span>
            )}

            {/* PREMIUM BADGE */}
            {showPremiumBadge && (
              <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 shrink-0">
                <Crown size={10} fill="currentColor" /> PREMIUM
              </span>
            )}

            {/* BESTSELLER BADGE */}
            {(course.is_bestseller || course.rating >= 4.8) && (
              <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded font-bold shrink-0">
                BESTSELLER
              </span>
            )}

            {/* UPDATED DATE */}
            <span className="text-green-600 text-[10px] font-bold shrink-0">
              Updated Jan 2026
            </span>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-xs text-gray-500 font-bold uppercase">
              What you'll learn
            </p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 items-start">
                <Check className="w-3 h-3 text-gray-700 mt-1 shrink-0" />
                <span className="text-sm text-gray-600 leading-tight">
                  Create modern web applications using React.
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAction}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
                userHasAccess
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-primary text-white hover:bg-opacity-90"
              }`}
            >
              {userHasAccess ? "View Course" : "Add to cart"}
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
