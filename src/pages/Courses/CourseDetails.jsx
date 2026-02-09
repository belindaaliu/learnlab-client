import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Clock,
  BookOpen,
  Star,
  Globe,
  CheckCircle,
  PlayCircle,
  Target,
  Heart,
} from "lucide-react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import VideoPreviewModal from "../../components/Modals/VideoPreviewModal";
import api from "../../utils/Api";
import { addToCart } from "../../services/cartService";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Management
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("Course Introduction");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isSubscriberCourse, setIsSubscriberCourse] = useState(false);
  const [starterPrice, setStarterPrice] = useState("0");

  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "Close",
    onConfirm: null,
  });

  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));

  // Get logged-in user
  // const user = JSON.parse(localStorage.getItem("user"));

  const extraData = {
    requirements: [
      "No prior experience is required. We will start from the very basics.",
      "A computer with internet access.",
      "Passion to learn and practice.",
    ],
    audience: [
      "CFA® Level 1 candidates",
      "People interested in taking the CFA® exams",
      "Individuals who are interested in a career in finance",
      "Anyone who wants to learn Ethics, Quantitative Methods, Corporate Finance, Economics",
    ],
    longDescription: `
      <p class="mb-4">We will help you prepare for the CFA® Level 1 Exam. A record number of candidates registers to take the CFA® exams. Pursuing the credential is a rigorous process, which requires a lot of time and effort.</p>
      <p class="mb-4"><strong>Why take our Bootcamp?</strong></p>
      <ul class="list-disc pl-5 mb-4 space-y-2">
        <li>A successful track record on Udemy – over 3,000,000 students have enrolled in our courses</li>
        <li>Experienced team – the authors of this course are finance professionals</li>
        <li>Carefully scripted and animated tutorials with plenty of real-world examples</li>
        <li>Extensive case studies that will help you reinforce what you have learned</li>
      </ul>
      <p class="mb-4">We will cover a wide variety of topics, including: Ethics, Quantitative Methods, Corporate Finance, Economics, and Alternative Investments.</p>
      <p>Click the "Buy Now" button and become a part of our program today.</p>
    `,
  };

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data.data || response.data);
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

      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      const inGuestCart = guestCart.some(
        (item) => Number(item.id) === Number(id),
      );

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

          //  Subscription Logic
          const subData = subRes.data?.data || subRes.data;
          if (subData?.hasActiveSubscription) {
            const features =
              typeof subData.features === "string"
                ? JSON.parse(subData.features)
                : subData.features;

            const hasSubAccess =
              features?.all_courses_access === true ||
              features?.subscriber_only_courses
                ?.map(String)
                .includes(String(id));

            setIsSubscriberCourse(!!hasSubAccess);
          }

          // Enrollment & Wishlist
          setIsEnrolled(
            coursesRes.data?.some((item) => item.id === parseInt(id)),
          );
          setIsInWishlist(
            wishlistRes.data?.some((item) => item.id === parseInt(id)),
          );
        } catch (err) {
          console.error("Status check failed:", err);
        }
      } else {
        setIsInCart(inGuestCart);
      }
    };

    checkAllStatuses();
  }, [id, user]);

  useEffect(() => {
    api
      .get("/subscription/plans")
      .then((res) => {
        const allPlans = res.data.data || [];
        // Find the plan with the slug or name 'starter'
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
  const hasAccess = isEnrolled || isSubscriberCourse || isActuallyFree;
  const requiredPlan = course?.required_plan_name || "VIP Plan";
  const isPremium = Number(course?.price) > 0;

  const handleAddToCart = async () => {
    if (!course || isEnrolled) return;

    if (user) {
      setAddingToCart(true);
      try {
        await addToCart(course.id);
        setIsInCart(true);
        setModalConfig({
          isOpen: true,
          title: "Added to Cart",
          message: `${course.title} is now in your cart.`,
          type: "success",
          confirmText: "View Cart",
          onConfirm: () => navigate("/cart"),
        });
      } catch (err) {
        setModalConfig({
          isOpen: true,
          title: "Action Failed",
          message: "Could not add to cart. It may already be there.",
          type: "danger",
          confirmText: "Close",
          onConfirm: closeModal,
        });
      } finally {
        setAddingToCart(false);
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
      setIsInCart(true);
      navigate("/cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
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
      setModalConfig({
        isOpen: true,
        title: "Checkout Error",
        message:
          "We encountered an issue starting your checkout. You might already have this item in your cart.",
        type: "warning",
        confirmText: "Go to Cart",
        onConfirm: () => navigate("/cart"),
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert("Please log in to add to wishlist");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      // await api.post(`/student/${user.id}/wishlist`, { courseId: course.id });
      const payload = { course_id: Number(course.id) };

      await api.post(`/student/${user.id}/wishlist`, payload);
      setIsInWishlist(true);
      alert("Added to wishlist!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!user) return;

    setWishlistLoading(true);
    try {
      await api.delete(`/student/${user.id}/wishlist/${course.id}`);
      setIsInWishlist(false);
      alert("Removed from wishlist");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove from wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const openPreview = (title = "Course Introduction") => {
    setPreviewTitle(title);
    setIsPreviewOpen(true);
  };

  if (loading)
    return <div className="text-center py-20">Loading course details...</div>;
  if (!course || !course.title)
    return <div className="text-center py-20">Course not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative">
      <VideoPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        course={course}
        title={previewTitle}
        videoUrl=""
      />

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm || closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        showCancel={
          modalConfig.type === "danger" || modalConfig.type === "warning"
        }
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

            <p className="text-lg text-slate-300 max-w-2xl">
              {course.description ||
                "Master the fundamentals with this comprehensive course."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-bold text-xs">
                Bestseller
              </span>
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="font-bold text-base">4.8</span>
                <div className="flex">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-blue-300 underline ml-1 cursor-pointer">
                  (120 ratings)
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
                <Clock className="w-4 h-4" /> Last updated 1/2026
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" /> English
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          <div className="bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              What you'll learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex gap-2 items-start text-sm text-gray-700"
                >
                  <CheckCircle className="w-4 h-4 text-gray-800 shrink-0 mt-0.5" />
                  <span>Master the fundamental concepts clearly.</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Course Content
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {[1, 2, 3].map((section, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-100 last:border-0"
                >
                  <div className="bg-gray-50 px-4 py-3 font-bold text-gray-800 flex justify-between cursor-pointer hover:bg-gray-100">
                    <span>Section {section}: Getting Started</span>
                    <span className="text-xs text-gray-500 font-normal">
                      3 lectures • 15min
                    </span>
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    <div className="flex justify-between text-sm text-gray-600 group">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-gray-800" />
                        <span
                          className="group-hover:underline cursor-pointer"
                          onClick={() => openPreview(`Lecture ${section}.1`)}
                        >
                          Introduction to Section {section}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-purple-600 font-bold text-xs cursor-pointer hover:text-purple-800 underline"
                          onClick={() => openPreview(`Lecture ${section}.1`)}
                        >
                          Preview
                        </span>
                        <span className="text-xs">05:20</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Requirements
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
              {extraData.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Description
            </h3>
            <div
              className={`prose text-gray-700 text-sm max-w-none overflow-hidden transition-all duration-300 ${showFullDesc ? "max-h-full" : "max-h-48"}`}
              dangerouslySetInnerHTML={{ __html: extraData.longDescription }}
            />
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-purple-600 font-bold text-sm mt-3 hover:underline flex items-center gap-1"
            >
              {showFullDesc ? "Show less" : "Show more"}
            </button>
          </div>

          {/* Who this course is for */}
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Who this course is for:
            </h3>
            <ul className="space-y-2">
              {extraData.audience.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-700">
                  <Target className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN (Sticky Sidebar) */}
        <div className="lg:col-span-1 relative">
          <div className="bg-white p-1 shadow-xl border border-gray-200 lg:sticky lg:top-24 -mt-32 lg:mt-0 z-10 w-full lg:w-[340px] ml-auto">
            <div
              className="relative aspect-video overflow-hidden group cursor-pointer border-b border-gray-100"
              onClick={() => openPreview()}
            >
              <img
                src={course.thumbnail_url || course.image}
                alt={course.title}
                className="w-full h-full object-cover"
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
                    ) : isSubscriberCourse && !isEnrolled ? (
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
                /* UPSell UI (Subscription vs Purchase) */
                <div className="flex flex-col">
                  {/* SUBSCRIPTION SECTION */}
                  <div className="space-y-3 pb-4">
                    <div className="flex items-start gap-2">
                      <div className="bg-purple-100 p-1 rounded">
                        <Star className="w-4 h-4 text-purple-700 fill-current" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          Included in{" "}
                          <span className="text-purple-700">
                            {requiredPlan}
                          </span>
                        </p>
                        <p className="text-[12px] text-gray-600 mt-1">
                          Unlock this premium course and 500+ others.
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
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${course.price}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ${Number(course.price) * 2}
                    </span>
                    <span className="text-sm text-gray-500">50% off</span>
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

                  {/* Wishlist Button */}
                  <button
                    onClick={
                      isInWishlist
                        ? handleRemoveFromWishlist
                        : handleAddToWishlist
                    }
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

                  {!isActuallyFree && (
                    <p className="text-center text-xs text-gray-500 mt-4">
                      30-Day Money-Back Guarantee
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-700 pt-2">
                <p className="font-bold">This course includes:</p>
                <div className="flex gap-2 items-center">
                  <Clock className="w-4 h-4" /> 56.5 hours on-demand video
                </div>
                <div className="flex gap-2 items-center">
                  <BookOpen className="w-4 h-4" /> 15 articles
                </div>
                <div className="flex gap-2 items-center">
                  <Globe className="w-4 h-4" /> Access on mobile and TV
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
