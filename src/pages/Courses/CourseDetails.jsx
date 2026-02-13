import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  Clock,
  BookOpen,
  Star,
  Globe,
  CheckCircle,
  PlayCircle,
  Target,
  Heart,
  Video,
  FileText,
  HelpCircle,
  Lock
} from "lucide-react";

import Button from "../../components/common/Button";
import VideoPreviewModal from "../../components/Modals/VideoPreviewModal";
import api from "../../utils/Api";
import { addToCart } from "../../services/cartService";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCartCount } = useCart();

  // --- State Management ---
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cart States
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isSubscriberOnlyCourse, setIsSubscriberOnlyCourse] = useState(false);
  const [hasSubscriberAccess, setHasSubscriberAccess] = useState(false);
  const [starterPrice, setStarterPrice] = useState("0");

  // Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePreviewLesson, setActivePreviewLesson] = useState(null);

  // UI States
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Wishlist & Enrollment States
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Parsed Data States
  const [parsedRequirements, setParsedRequirements] = useState([]);
  const [parsedAudience, setParsedAudience] = useState([]);

  // Modal Config State (Kept but unused per request)
  // eslint-disable-next-line no-unused-vars
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "Close",
    onConfirm: null,
  });

  // --- Utility: Safe JSON Parse ---
  const safelyParseJSON = (data) => {
    if (!data) return [];
    try {
      if (Array.isArray(data)) return data;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("JSON Parse fallback:", error);
      return [data];
    }
  };

  // --- Fetch Course Data ---
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${id}`);
        console.log("Full API Response:", response.data);

        const courseData = response.data.data || response.data;
        setCourse(courseData);

        if (
          courseData.required_plan_name &&
          courseData.required_plan_name !== "Standard"
        ) {
          setIsSubscriberOnlyCourse(true);
        } else {
          setIsSubscriberOnlyCourse(false);
        }

        setParsedRequirements(safelyParseJSON(courseData.requirements));
        setParsedAudience(safelyParseJSON(courseData.target_audience));
      } catch (error) {
        console.error(
          "Fetch Error:",
          error.response?.data?.message || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  useEffect(() => {
    const checkAllStatuses = async () => {
      if (!id) return;

      if (!course) return;

      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      const inGuestCart = guestCart.some(
        (item) => Number(item.id) === Number(id),
      );

      setIsEnrolled(false);
      setHasSubscriberAccess(false);

      if (user) {
        try {
          const [coursesRes, wishlistRes, cartRes, subRes] = await Promise.all([
            api.get(`/student/${user.id}/courses`),
            api.get(`/student/${user.id}/wishlist`),
            api.get("/cart"),
            api.get("/subscription/overview"),
          ]);

          const cartData = cartRes.data?.data || cartRes.data;
          const cartItems = Array.isArray(cartData?.items)
            ? cartData.items
            : Array.isArray(cartData)
              ? cartData
              : [];

          const inBackendCart = cartItems.some(
            (item) => Number(item.course_id || item.courseId) === Number(id),
          );

          setIsInCart(inGuestCart || inBackendCart);

          const subData = subRes.data?.data || subRes.data;

          if (subData?.hasActiveSubscription) {
            const userPlanName = String(
              subData.plan_name || subData.planName || "",
            )
              .trim()
              .toLowerCase();

            const coursePlanName = String(
              course?.SubscriptionPlans?.name ||
                course?.required_plan_name ||
                "",
            )
              .trim()
              .toLowerCase();

            const hasSubAccess =
              !!coursePlanName &&
              !!userPlanName &&
              userPlanName === coursePlanName;

            setHasSubscriberAccess(hasSubAccess);
          } else {
            setHasSubscriberAccess(false);
          }

          // Enrollment & Wishlist
          setIsEnrolled(
            coursesRes.data?.some((item) => item.id === parseInt(id)),
          );

          const wishlistData = wishlistRes.data?.data || wishlistRes.data || [];
          const courseId = Number(id);

          setIsInWishlist((prev) => {
            if (prev) return prev;

            const onServer = wishlistData.some(
              (item) => Number(item.id) === courseId,
            );

            return !!onServer;
          });
        } catch (err) {
          console.error("Status check failed:", err);
        }
      } else {
        setIsInCart(inGuestCart);
      }
    };

    checkAllStatuses();
  }, [id, user, course]);

  useEffect(() => {
    api
      .get("/subscription/plans")
      .then((res) => {
        const allPlans = res.data.data || [];
        const starterPlan = allPlans.find(
          (p) =>
            p.slug?.toLowerCase() === "starter" ||
            p.name?.toLowerCase() === "starter",
        );

        if (starterPlan) {
          setStarterPrice(Number(starterPlan.price).toFixed(2));
        }
      })
      .catch((err) => console.error("Error fetching starter price", err));
  }, []);

  // --- LOGIC VARIABLES ---
  const isActuallyFree = course && Number(course.price) === 0;

  const hasAccess =
    isActuallyFree || (!!user && (isEnrolled || hasSubscriberAccess));

  const requiredPlan =
    course?.SubscriptionPlans?.name || course?.required_plan_name;

  const hasRequiredPlan = !!requiredPlan;

  const isPremium = Number(course?.price) > 0;

  // --- Dynamic Calculations ---
 // --- Dynamic Calculations ---
const courseStats = useMemo(() => {

  if (!course?.CourseContent || !Array.isArray(course.CourseContent)) {
    return { totalHours: 0, totalMinutes: 0, articles: 0, lectures: 0 };
  }

  let totalSeconds = 0;
  let articlesCount = 0;
  let lecturesCount = 0;

  course.CourseContent.forEach((item) => {

    if (item.type !== "section") {
      lecturesCount++;

      if (item.type?.toLowerCase() === "video") {

        const duration = Number(item.duration_seconds) || 0;
        totalSeconds += duration;
      }

      if (item.type?.toLowerCase() === "note") {
        articlesCount++;
      }
    }
  });

  let totalHours = Math.floor(totalSeconds / 3600);
  let remainingSeconds = totalSeconds % 3600;
  let totalMinutes = Math.floor(remainingSeconds / 60);

  if (remainingSeconds % 60 > 0) {
    totalMinutes += 1;
  }

  if (totalMinutes === 60) {
    totalHours += 1;
    totalMinutes = 0;
  }

  if (totalSeconds > 0 && totalHours === 0 && totalMinutes === 0) {
    totalMinutes = 1;
  }

  return {
    totalHours,
    totalMinutes,
    articles: articlesCount,
    lectures: lecturesCount,
  };
}, [course]);

  const sections =
    course?.CourseContent?.filter((item) => item.type === "section") || [];

  // --- Handlers ---

  const handleAddToCart = async () => {
    if (!course || isEnrolled) return;

    if (user) {
      // LOGGED IN: backend cart
      setAddingToCart(true);
      try {
        await addToCart(course.id);
        setIsInCart(true);
        await fetchCartCount();
        toast.success("Course added to your cart!");
      } catch (err) {
        console.error(err);
        toast.error("Could not add to cart. It may already be there.");
      } finally {
        setAddingToCart(false);
      }
    } else {
      // Guest Logic: localStorage only
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (!guestCart.find((item) => item.id === course.id)) {
        guestCart.push({
          id: course.id,
          title: course.title,
          price: course.price,
          thumbnail: course.thumbnail_url,
          instructor_id: course.Users?.id,
          instructor_name: `${course.Users?.first_name} ${course.Users?.last_name}`,
        });
        localStorage.setItem("cart", JSON.stringify(guestCart));
        toast.success("Added to cart as guest!");
      } else {
        toast("This course is already in your cart.", { icon: "ℹ️" });
      }
      setIsInCart(true);
      await fetchCartCount();
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please log in to buy this course.");
      navigate("/login", {
        state: {
          from: `/course/${id}`,
          intent: "buy_now",
          courseId: id,
        },
      });
      return;
    }

    try {
      await addToCart(course.id);
      await fetchCartCount();
      navigate("/checkout", {
        state: {
          checkoutType: "cart",
          cartItems: [
            {
              id: course.id,
              title: course.title,
              price: course.price,
            },
          ],
          totalAmount: Number(course.price),
        },
      });
    } catch (err) {
      console.error("Checkout failed:", err);
      // Removed setModalConfig usage here to use Toast instead as requested
      toast.error("We encountered an issue starting your checkout.");
    }
  };

  // Wishlist Toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      alert("Please log in to manage your wishlist");
      navigate("/login", { state: { from: `/course/${id}` } });
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/student/${user.id}/wishlist/${course.id}`);
        setIsInWishlist(false);
      } else {
        const payload = { course_id: Number(course.id) };
        await api.post(`/student/${user.id}/wishlist`, payload);
        setIsInWishlist(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message;

      if (!isInWishlist && msg === "Course already in wishlist") {
        setIsInWishlist(true);
        toast.error("Course is already in your wishlist.");
      } else {
        console.error("Wishlist action failed:", err.response?.data || err);
        alert(msg || "Failed to update wishlist");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // --- Open Preview Logic ---
  const openPreview = (lesson) => {
    if (lesson && lesson.is_preview) {
        setActivePreviewLesson(lesson);
        setIsPreviewOpen(true);
    } 
    else if (!lesson) {
        const firstPreview = course?.CourseContent?.find(c => c.is_preview);
        if (firstPreview) {
            setActivePreviewLesson(firstPreview);
            setIsPreviewOpen(true);
        } else {
            toast("No preview content available for this course.");
        }
    }
  };

  // --- Modal Unlock Logic ---
  const handleModalUnlock = async () => {
    // If Subscription-only course
    if (isSubscriberOnlyCourse) {
      navigate("/pricing"); 
      return;
    }

    // Purchase Logic
    if (user) {
      try {
        await addToCart(course.id);
        await fetchCartCount();
        toast.success("Course added to cart! Redirecting...");
        navigate("/cart");
      } catch (err) {
        console.error("Not added to Cart!", err);
        navigate("/cart");
      }
    } else {
      // Guest Logic
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (!guestCart.find((item) => item.id === course.id)) {
        guestCart.push({
          id: course.id,
          title: course.title,
          price: course.price,
          thumbnail: course.thumbnail_url,
          instructor_id: course.Users?.id,
          instructor_name: `${course.Users?.first_name} ${course.Users?.last_name}`,
        });
        localStorage.setItem("cart", JSON.stringify(guestCart));
      }
      navigate("/cart");
    }
  };

  if (loading)
    return <div className="text-center py-20">Loading course details...</div>;

  if (!course || !course.title)
    return <div className="text-center py-20">Course not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative animate-in fade-in duration-500">
      
      <VideoPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        activeLesson={activePreviewLesson} 
        courseContent={course?.CourseContent || []} 
        courseTitle={course?.title}
        courseImage={course?.thumbnail_url}
        onChangeLesson={(lesson) => setActivePreviewLesson(lesson)}
        // Props for smart Unlock Button
        onUnlock={handleModalUnlock}
        unlockLabel={isSubscriberOnlyCourse ? "Get Subscription Access" : "Buy This Course"}
        coursePrice={course?.price}
      />

      {/* HERO HEADER */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-4">
            <div className="text-purple-300 text-sm font-bold uppercase tracking-wide">
              {course.Categories?.name || "Development"} {">"} {course.title}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
              {course.title}
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl line-clamp-2">
              {course.description || course.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
              {(course.enrollments_count > 100 || course.views > 500) && (
                <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-bold text-xs">
                  Bestseller
                </span>
              )}

              <div className="flex items-center gap-1 text-yellow-400">
                <span className="font-bold text-base">
                  {course.rating || "4.8"}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(course.rating || 5)
                          ? "fill-current"
                          : "text-gray-500"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-blue-300 underline ml-1 cursor-pointer">
                  ({course.enrollments_count || 0} students)
                </span>
              </div>

              <div className="text-slate-300">
                Created by{" "}
                <span className="text-purple-300 underline cursor-pointer">
                  {course.Users?.first_name} {course.Users?.last_name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Last updated{" "}
                {new Date(course.updated_at || Date.now()).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" /> {course.language || "English"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Requirements */}
          <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Requirements / What you'll learn
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {parsedRequirements.length > 0 ? (
                parsedRequirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start text-sm text-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 text-gray-800 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No specific requirements listed.
                </p>
              )}
            </div>
          </div>

          {/* Course Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Course Content
            </h3>
            {sections.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                {sections
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((section, idx) => {
                    const lessons = course.CourseContent.filter(
                      (c) => c.parent_id === section.id && c.type !== "section",
                    ).sort((a, b) => a.order_index - b.order_index);

                    return (
                      <div
                        key={section.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <div className="bg-gray-50 px-4 py-3 font-bold text-gray-800 flex justify-between items-center cursor-default">
                          <span>
                            Section {idx + 1}: {section.title}
                          </span>
                          <span className="text-xs text-gray-500 font-normal">
                            {lessons.length} lectures
                          </span>
                        </div>
                        <div className="p-4 space-y-3 bg-white">
                          {lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="flex justify-between text-sm text-gray-600 group"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === "video" && <Video className="w-4 h-4 text-gray-400" />}
                                {lesson.type === "note" && <FileText className="w-4 h-4 text-gray-400" />}
                                {lesson.type === "assessment" && <HelpCircle className="w-4 h-4 text-gray-400" />}
                                
                                <span
                                  className={
                                    lesson.is_preview
                                      ? "group-hover:underline cursor-pointer"
                                      : ""
                                  }
                                  onClick={() =>
                                    lesson.is_preview && openPreview(lesson)
                                  }
                                >
                                  {lIdx + 1}. {lesson.title}
                                </span>
                              </div>
                              {lesson.is_preview ? (
                                <div className="flex items-center gap-4">
                                  <span
                                    className="text-purple-600 font-bold text-xs cursor-pointer hover:text-purple-800 underline"
                                    onClick={() => openPreview(lesson)}
                                  >
                                    Preview
                                  </span>
                                  {lesson.duration_seconds && (
                                    <span className="text-xs">
                                      {Math.floor(lesson.duration_seconds / 60)}
                                      :00
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Lock className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          ))}
                          {lessons.length === 0 && (
                            <p className="text-xs text-gray-400 italic">
                              No lessons in this section yet.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">
                Content is being updated.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Description
            </h3>
            <div
              className={`prose text-gray-700 text-sm max-w-none overflow-hidden transition-all duration-300 ${
                showFullDesc ? "max-h-full" : "max-h-48"
              }`}
              dangerouslySetInnerHTML={{
                __html: course.long_description || course.description,
              }}
            />
            {(course.long_description?.length > 300 ||
              course.description?.length > 300) && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-purple-600 font-bold text-sm mt-3 hover:underline flex items-center gap-1"
              >
                {showFullDesc ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* Who this course is for */}
          {parsedAudience.length > 0 && (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Who this course is for:
              </h3>
              <ul className="space-y-2">
                {parsedAudience.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-700">
                    <Target className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Sticky Sidebar) */}
        <div className="lg:col-span-1 relative">
          <div className="bg-white p-1 shadow-xl border border-gray-200 lg:sticky lg:top-24 -mt-32 lg:mt-0 z-10 w-full lg:w-[340px] ml-auto">
            <div
              className="relative aspect-video overflow-hidden group cursor-pointer border-b border-gray-100"
              onClick={() => openPreview()}
            >
              <img
                src={
                  course.thumbnail_url || "[https://via.placeholder.com/640x360](https://via.placeholder.com/640x360)"
                }
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "[https://via.placeholder.com/640x360](https://via.placeholder.com/640x360)";
                }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition">
                <div className="bg-white rounded-full p-4 shadow-lg group-hover:scale-110 transition">
                  <PlayCircle className="w-8 h-8 text-black fill-current" />
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-lg drop-shadow-md">
                Preview this course
              </div>
            </div>

            <div className="p-6 space-y-4">
              {hasAccess ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    {isActuallyFree ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-bold">Free Course</p>
                        <p className="text-green-600 text-xs">
                          Open for all students
                        </p>
                      </>
                    ) : hasSubscriberAccess && !isEnrolled ? (
                      <>
                        <Star className="w-8 h-8 text-blue-600 mx-auto mb-2 fill-current" />
                        <p className="text-blue-800 font-bold">
                          Included in your Plan
                        </p>
                        <p className="text-blue-600 text-xs">
                          Subscriber Exclusive Access
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-semibold">
                          You own this course
                        </p>
                      </>
                    )}
                  </div>
                  <Button
                    fullWidth
                    size="lg"
                    className="w-full py-3 h-12 text-lg font-bold bg-blue-600"
                    onClick={() => navigate(`/course/${course.id}/learn`)}
                  >
                    Start Learning
                  </Button>
                </div>
              ) : (
                // UPSell UI (Subscription vs Purchase)
                <div className="flex flex-col">
                  {isSubscriberOnlyCourse && hasRequiredPlan && (
                    <>
                      <div className="space-y-3 pb-4">
                        <div className="flex items-start gap-2">
                          <div className="bg-purple-100 p-1 rounded">
                            <Star className="w-4 h-4 text-purple-700 fill-current" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">
                              Get access with{" "}
                              <span className="text-purple-700">
                                {requiredPlan}
                              </span>
                            </p>
                            <p className="text-[12px] text-gray-600 mt-1">
                              Upgrade your plan to watch this course and others
                              in {requiredPlan}.
                            </p>
                          </div>
                        </div>

                        <Button
                          fullWidth
                          className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold h-12 rounded-md shadow-sm"
                          onClick={() => navigate("/pricing")}
                        >
                          Upgrade to {requiredPlan}
                        </Button>

                        <div className="text-center">
                          <p className="text-[11px] text-gray-500 font-medium">
                            Plans starting at ${starterPrice}/mo
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Cancel anytime
                          </p>
                        </div>
                      </div>

                      {/* DIVIDER */}
                      <div className="flex items-center my-2">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="px-3 text-xs text-gray-500 font-medium uppercase">
                          or
                        </span>
                        <div className="flex-grow border-t border-gray-300"></div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${course.price}
                    </span>
                    {isPremium && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          {(Number(course.price) * 1.2).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">20% off</span>
                      </>
                    )}
                  </div>

                  <Button
                    fullWidth
                    onClick={
                      isInCart ? () => navigate("/cart") : handleAddToCart
                    }
                    isLoading={addingToCart}
                    variant={isInCart ? "outline" : "primary"}
                    className="w-full py-3 border rounded-lg font-bold transition flex items-center justify-center gap-2"
                  >
                    {isInCart ? "Go to Cart" : "Add to Cart"}
                  </Button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3 my-3 border border-gray-800 rounded-lg font-bold text-gray-800 hover:bg-gray-50 transition"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              {/* Wishlist button – always visible */}
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`w-full py-3 border rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                  isInWishlist
                    ? "bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
                    : "border-purple-600 text-purple-600 hover:bg-purple-50"
                } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`}
                />
                {wishlistLoading
                  ? "Processing..."
                  : isInWishlist
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
              </button>

              {isPremium && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  30-Day Money-Back Guarantee
                </p>
              )}

              {/* Sidebar Stats */}
              <div className="space-y-2 text-sm text-gray-700 pt-2">
                <p className="font-bold">This course includes:</p>
                <div className="flex gap-2 items-center">
                  <Clock className="w-4 h-4" />
                  {courseStats.totalHours > 0
                    ? `${courseStats.totalHours}h ${courseStats.totalMinutes}m`
                    : `${courseStats.totalMinutes}m`}{" "}
                  on-demand video
                </div>
                <div className="flex gap-2 items-center">
                  <BookOpen className="w-4 h-4" /> {courseStats.articles}{" "}
                  articles / notes
                </div>
                <div className="flex gap-2 items-center">
                  <Globe className="w-4 h-4" /> Access on mobile and TV
                </div>
                <div className="flex gap-2 items-center">
                  <CheckCircle className="w-4 h-4" /> Full lifetime access
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;