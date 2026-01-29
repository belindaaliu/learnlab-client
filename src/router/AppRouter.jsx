import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";

import Home from "../pages/Home/Home";
import CoursesList from "../pages/Courses/CoursesList";
import StudentDashboard from "../pages/Student/Dashboard";
import Cart from "../pages/Cart/Cart";
import CartTest from "../pages/Cart/CartTest";

export const router = createBrowserRouter([
  // PUBLIC LAYOUT
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/cart", element: <Cart /> },
      { path: "/cart-test", element: <CartTest /> },
      { path: "/courses", element: <CoursesList /> }
    ],
  },

  // STUDENT LAYOUT
  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
    ],
  },
]);



