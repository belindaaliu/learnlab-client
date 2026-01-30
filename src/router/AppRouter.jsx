import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";
import MyLearning from "../pages/Student/MyLearning";

import Home from "../pages/Home/Home";
import StudentDashboard from "../pages/Student/Dashboard";

export const router = createBrowserRouter([
  // PUBLIC LAYOUT
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
    ],
  },

  // STUDENT LAYOUT
  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "learning", element: <MyLearning /> },
    ],
  },
]);
