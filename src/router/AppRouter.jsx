import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import MyLearning from "../pages/Student/MyLearning";
import StudentCertificates from "../pages/Student/StudentCertificates";
import CertificateDetail from "../pages/Student/CertificateDetail";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home/Home";
import CoursesList from "../pages/Courses/CoursesList";
import CourseDetails from "../pages/Courses/CourseDetails";
import StudentDashboard from "../pages/Student/Dashboard";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import SubscriptionOverview from "../pages/Subscription/Overview";
import SubscriptionPlans from "../pages/Subscription/Plans";
import PaymentHistory from "../pages/Payment/History";
import PaymentSuccess from "../pages/Checkout/PaymentSuccess";
import VerifyCertificate from "../pages/VerifyCertificate";
import AdminInstructors from "../pages/Admin/AdminInstructors";
import AdminInstructorReview from "../pages/Admin/AdminInstructorReview";
import AdminDashboard from "../pages/Admin/AdminDashboard";

export const router = createBrowserRouter([
  // PUBLIC LAYOUT
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

      //
    ],
  },

  // AUTH ROUTES
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // STUDENT LAYOUT
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
      { path: "certificates", element: <StudentCertificates /> },
      { path: "certificates/:courseId", element: <CertificateDetail /> },

      // --- Subscription Routes ---
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
    ],
  },

  // ADMIN LAYOUT
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
      {
        path: "instructors/:instructorId/review",
        element: <AdminInstructorReview />,
      },
      { path: "analytics", element: <div>Analytics Page Coming Soon</div> },
      { path: "courses", element: <div>Course List Page Coming Soon</div> },
    ],
  },
  
]);
