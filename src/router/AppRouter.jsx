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
import PublicProfile from "../pages/Student/PublicProfile";
import EditProfile from "../pages/Student/EditProfile";
import EditPhoto from "../pages/Student/EditPhoto";
// import AccountSecurity from "../pages/Student/AccountSecurity";
// import NotificationSettings from "../pages/Student/NotificationSettings";
// import PrivacySettings from "../pages/Student/PrivacySettings";



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
      // { path: "/student/public-profile/:id", element: <PublicProfile /> },
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
      { path: "public-profile/:id", element: <PublicProfile /> },
      { path: "edit-profile", element: <EditProfile /> },
      { path: "edit-photo", element: <EditPhoto /> },
      // { path: "security", element: <AccountSecurity /> },
      // { path: "notifications", element: <NotificationSettings /> },
      // { path: "privacy", element: <PrivacySettings /> },

    ],
  }
,
]);