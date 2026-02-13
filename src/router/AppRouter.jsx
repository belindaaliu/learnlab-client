import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import InstructorLayout from "../layouts/InstructorLayout";

// COMPONENTS
import ProtectedRoute from "../components/ProtectedRoute";

// AUTH PAGES
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

// PUBLIC PAGES
import Home from "../pages/Home/Home";
import CoursesList from "../pages/Courses/CoursesList";
import CourseDetails from "../pages/Courses/CourseDetails";
import VerifyCertificate from "../pages/VerifyCertificate";

// CART & CHECKOUT PAGES
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import PaymentSuccess from "../pages/Checkout/PaymentSuccess";

// STUDENT PAGES
import StudentDashboard from "../pages/Student/Dashboard";
import MyLearning from "../pages/Student/MyLearning";
import StudentCertificates from "../pages/Student/StudentCertificates";
import CertificateDetail from "../pages/Student/CertificateDetail";
import PublicProfile from "../pages/Student/PublicProfile";
import EditProfile from "../pages/Student/EditProfile";
import EditPhoto from "../pages/Student/EditPhoto";
import Messages from "../pages/Student/Messages";

// SUBSCRIPTION & PAYMENT PAGES
import SubscriptionOverview from "../pages/Subscription/Overview";
import SubscriptionPlans from "../pages/Subscription/Plans";
import PaymentHistory from "../pages/Payment/History";

// ADMIN PAGES
import AdminInstructors from "../pages/Admin/AdminInstructors";
import AdminInstructorReview from "../pages/Admin/AdminInstructorReview";
import AdminInstructorDetails from "../pages/Admin/AdminInstructorDetails.jsx";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminCourses from "../pages/Admin/AdminCourses";
import AdminAnalytics from "../pages/Admin/AdminAnalytics";
import Users from "../pages/Admin/Users";
import UserDetail from "../pages/Admin/UserDetail";
import Subscriptions from "../pages/Admin/Subscriptions";
import AdminCourseDetail from "../pages/Admin/AdminCourseDetail";


// INSTRUCTOR PAGES
import InstructorDashboard from "../pages/Instructor/Dashboard";
import InstructorCoursesList from "../pages/Instructor/CoursesList";
import CreateCourse from "../pages/Instructor/CreateCourse";
import EditCourse from "../pages/Instructor/EditCourse";
import InstructorMessages from "../pages/Instructor/Messages";

import CoursePlayer from "../pages/Student/CoursePlayer";

import InstructorPerformance from '../pages/Instructor/InstructorPerformance';

import QuizReview from "../pages/Student/QuizReview";
import StudentProgressDetail from "../pages/Instructor/StudentProgressDetail";
import InstructorStudentsList from "../pages/Instructor/InstructorStudentsList";

import InstructorQuizReview from "../pages/Instructor/InstructorQuizReview";

import Teach from "../pages/Home/Teach";

export const router = createBrowserRouter([
  // ===================================
  // PUBLIC LAYOUT
  // ===================================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "teach", element: <Teach /> },

      { path: "/courses", element: <CoursesList /> },
      { path: "/courses/search", element: <CoursesList /> },
      { path: "/courses/:id", element: <CourseDetails /> },
      { path: "pricing", element: <SubscriptionPlans /> },
      { path: "/cart", element: <Cart /> },
      { path: "/verify/:certId", element: <VerifyCertificate /> },

      {
        path: "/payment-success",
        element: (
          <ProtectedRoute allowedRoles="student">
            <PaymentSuccess />
          </ProtectedRoute>
        ),
      },

      {
        path: "/checkout",
        element: (
          <ProtectedRoute allowedRoles="student">
            <Checkout />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ===================================
  // AUTH ROUTES
  // ===================================
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },

  // ===================================
  // STUDENT LAYOUT
  // ===================================
  {
    path: "/student",
    element: (
      <ProtectedRoute allowedRoles="student">
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "learning", element: <MyLearning /> },
      { path: "public-profile/:id", element: <PublicProfile /> },
      { path: "edit-profile", element: <EditProfile /> },
      { path: "edit-photo", element: <EditPhoto /> },
      { path: "messages", element: <Messages /> },
      { path: "cart", element: <Cart /> },
      // { path: "security", element: <AccountSecurity /> },
      // { path: "notifications", element: <NotificationSettings /> },
      // { path: "privacy", element: <PrivacySettings /> },
      
      // Certificate Routes
      { path: "certificates", element: <StudentCertificates /> },
      { path: "certificates/:courseId", element: <CertificateDetail /> },


      // QUIZ REVIEW ROUTE
      {
        path: "quiz-review/:attemptId",
        element: <QuizReview />,
      },

      // Subscription Routes
      {
        path: "subscription",
        children: [
          { index: true, element: <SubscriptionOverview /> },
          { path: "plans", element: <SubscriptionPlans /> },
          { path: "history", element: <PaymentHistory /> },
        ],
      },

      {
        path: "payment",
        children: [{ path: "history", element: <PaymentHistory /> }],
      },

      // { path: "course/:courseId/learn", element: <CoursePlayer /> },
    ],
  },

  {
  path: "/course/:courseId/learn",
  element: (
    <ProtectedRoute allowedRoles="student">
      <CoursePlayer />
    </ProtectedRoute>
  ),
},


  // ===================================
  // INSTRUCTOR LAYOUT
  // ===================================
  {
    path: "/instructor",
    element: (
      <ProtectedRoute allowedRoles="instructor">
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <InstructorDashboard /> },
      
      // List of courses
      { path: "courses", element: <InstructorCoursesList /> },
      
      // Create a new course
      { path: "courses/create", element: <CreateCourse /> },
      
      // Edit a course
      { path: "courses/edit/:id", element: <EditCourse /> },

      // Performance
      { path: "performance", element: <InstructorPerformance /> },
      
      // Messages
      { path: "messages", element: <InstructorMessages /> },
      { path: "edit-profile", element: <EditProfile /> },
      { path: "edit-photo", element: <EditPhoto /> },
      { path: "courses/:courseId/students/:studentId/progress", element: <StudentProgressDetail /> },
      { path: "courses/:courseId/students", element: <InstructorStudentsList /> },
      { path: "quiz-review/:attemptId", element: <InstructorQuizReview />,}

    ],
  },

  // ===================================
  // COURSE PLAYER (FULL PAGE)
  // ===================================
  {
    path: "/course/:courseId/learn",
    element: (
      <ProtectedRoute allowedRoles="student">
        <CoursePlayer />
      </ProtectedRoute>
    ),
  },

  // ===================================
  // QUIZ REVIEW STANDALONE ROUTE
  // ===================================
  {
    path: "/quiz-review/:attemptId",
    element: (
      <ProtectedRoute allowedRoles="student">
        <QuizReview />
      </ProtectedRoute>
    ),
  },
  

  // ===================================
  // ADMIN LAYOUT
  // ===================================
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "instructors", element: <AdminInstructors /> },
      { path: "instructors/:instructorId/review", element: <AdminInstructorReview /> },
      { path: "instructors/:id/details", element: <AdminInstructorDetails /> },
      
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "courses", element: <AdminCourses /> },
      { path: "courses/:courseId", element: <AdminCourseDetail /> },
      { path: "users", element: <Users /> },
      { path: "users/:userId", element: <UserDetail /> },
      { path: "subscriptions", element: <Subscriptions /> },
    ],
  },
]);