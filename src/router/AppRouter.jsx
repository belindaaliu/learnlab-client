import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";
import InstructorLayout from "../layouts/InstructorLayout";

// COMPONENTS & PAGES
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home/Home";
import CoursesList from "../pages/Courses/CoursesList";
import CourseDetails from "../pages/Courses/CourseDetails"; 
import Cart from "../pages/Cart/Cart";
import CartTest from "../pages/Cart/CartTest";

// AUTH
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

// STUDENT PAGES
import StudentDashboard from "../pages/Student/Dashboard";
import MyLearning from "../pages/Student/MyLearning";

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

      { path: "/cart", element: <Cart /> },
      { path: "/cart-test", element: <CartTest /> },
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

  // ===================================
  // INSTRUCTOR LAYOUT
  // ===================================
  {
    path: "/instructor",
    element: (
      // Only users with the instructor role are allowed to log in.
      <ProtectedRoute allowedRoles="instructor">
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <InstructorDashboard /> },
      
      // لیست دوره‌ها
      { path: "courses", element: <InstructorCoursesList /> },
      
      // ساخت دوره جدید
      { path: "courses/create", element: <CreateCourse /> },
    ],
  },
]);