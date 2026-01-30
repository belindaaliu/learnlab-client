import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";
import MyLearning from "../pages/Student/MyLearning";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home/Home";
import CoursesList from "../pages/Courses/CoursesList";

import CourseDetails from "../pages/Courses/CourseDetails"; 

import StudentDashboard from "../pages/Student/Dashboard";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";

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

      { path: "/cart", element: <Cart /> },

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
    ],
  },
]);