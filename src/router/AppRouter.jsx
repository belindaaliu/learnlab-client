import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";
import InstructorLayout from "../layouts/InstructorLayout";

// COMPONENTS
import ProtectedRoute from "../components/ProtectedRoute";

// AUTH PAGES
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

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

// SUBSCRIPTION & PAYMENT PAGES
import SubscriptionOverview from "../pages/Subscription/Overview";
import SubscriptionPlans from "../pages/Subscription/Plans";
import PaymentHistory from "../pages/Payment/History";

// ADMIN PAGES (Added from Main Branch)
import AdminInstructors from '../pages/admin/AdminInstructors';
import AdminInstructorReview from '../pages/admin/AdminInstructorReview';

// INSTRUCTOR PAGES
import InstructorDashboard from "../pages/Instructor/Dashboard";
import InstructorCoursesList from "../pages/Instructor/CoursesList";
import CreateCourse from "../pages/Instructor/CreateCourse";

export const router = createBrowserRouter([
  // ===================================
  // PUBLIC LAYOUT
  // ===================================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      
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
        ) 
      },
      
      { 
        path: "/checkout", 
        element: (
          <ProtectedRoute allowedRoles="student">
            <Checkout />
          </ProtectedRoute>
        ) 
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
      
      // Certificate Routes
      { path: "certificates", element: <StudentCertificates /> },
      { path: "certificates/:courseId", element: <CertificateDetail /> },

      // Subscription Routes
      { 
        path: "subscription", 
        children: [
          { index: true, element: <SubscriptionOverview /> },
          { path: "plans", element: <SubscriptionPlans /> },
          { path: "history", element: <PaymentHistory /> },
        ]
      },

      { 
        path: "payment", 
        children: [
          { path: "history", element: <PaymentHistory /> },
        ]
      },
    ],
  },

  // ===================================
  // INSTRUCTOR LAYOUT (From Your Branch)
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
    ],
  },

  // ===================================
  // ADMIN LAYOUT (From Main Branch)
  // ===================================
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles="admin">

      </ProtectedRoute>
    ),
    children: [
      // { path: "dashboard", element: <AdminDashboard /> }, // This line was in the original code but was not imported, comment if it gives an error
      { path: "instructors", element: <AdminInstructors /> },
      { path: "instructors/:instructorId/review", element: <AdminInstructorReview /> },
    ]
  },
]);