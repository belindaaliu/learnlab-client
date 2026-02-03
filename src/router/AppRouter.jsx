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
      // { path: "/student/public-profile/:id", element: <PublicProfile /> },
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
    ],
  },
]);