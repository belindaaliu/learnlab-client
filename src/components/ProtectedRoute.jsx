import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component to guard routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string|string[]} props.allowedRoles - Optional role(s) that are allowed to access this route
 */
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles) {
    try {
      const user = JSON.parse(userStr);
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(user.role)) {
        // User doesn't have the required role
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      // Invalid user data in localStorage
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
