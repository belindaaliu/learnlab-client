import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, 
  MessageSquare, 
  BarChart, 
  BookOpen, 
  LogOut, 
  LayoutDashboard, 
  Check, 
  Trash2,
  User,
  Settings
} from "lucide-react";
import logo from "../../assets/images/logo.png";

export default function InstructorNavbar() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/.");
  };

  useEffect(() => {
    if (!userId) return;

    // FIXED: Use the correct endpoint with auth header
    const token = localStorage.getItem('token');
    axios
      .get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Profile fetch error:", err));
  }, [userId, API_URL]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_published':
      case 'course_updated':
        return '📚';
      case 'new_enrollment':
        return '👤';
      case 'course_completion':
        return '🎓';
      case 'new_review':
        return '⭐';
      case 'subscription_activated':
      case 'subscription_cancelled':
        return '💳';
      case 'new_message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const displayPhoto = profile?.photo_url || user?.photo_url;
  const displayFirstName = profile?.first_name || user?.first_name || "I";
  const displayLastName = profile?.last_name || user?.last_name || "";

  return (
    <header className="bg-slate-900 text-white h-20 shadow-md flex items-center px-6 gap-6 sticky top-0 z-50">
      
      {/* LEFT — Logo & Brand Split Navigation */}
      <div className="flex items-center gap-8 shrink-0">
        
        <div className="flex items-center gap-3">
          <Link to="/" title="Go to Main Site">
            <img src={logo} alt="LearnLab" className="h-8 w-auto object-contain brightness-0 invert hover:opacity-80 transition" />
          </Link>

          <div className="h-6 w-px bg-slate-700 mx-1"></div>

          <span className="text-xs font-bold bg-purple-600 px-2 py-0.5 rounded uppercase tracking-wider">
            Instructor
          </span>
        </div>

        {/* Instructor Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link to="/instructor/dashboard" className="hover:text-white transition flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4"/> Dashboard
          </Link>
          <Link to="/instructor/courses" className="hover:text-white transition flex items-center gap-2">
            <BookOpen className="w-4 h-4"/> Courses
          </Link>
          <Link to="/instructor/messages" className="hover:text-white transition flex items-center gap-2">
            <MessageSquare className="w-4 h-4"/> Messages
          </Link>
          <Link to="/instructor/performance" className="hover:text-white transition flex items-center gap-2">
            <BarChart className="w-4 h-4"/> Performance
          </Link>
        </nav>
      </div>

      {/* SPACER */}
      <div className="flex-1"></div>

      {/* RIGHT — Actions */}
      <div className="flex items-center gap-6 shrink-0">

        {/* Switch to Student View Button */}
        <Link 
          to="/" 
          className="hidden md:block text-xs font-bold text-slate-900 bg-white hover:bg-gray-100 px-4 py-2 rounded-full transition"
        >
          Student View
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-400 hover:text-white transition"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[600px] overflow-hidden flex flex-col z-50">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.notification_id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notif.is_read ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(notif.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.notification_id)}
                              className="text-purple-600 hover:text-purple-700"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.notification_id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View All Button */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-200 p-3">
                  <Link
                    to="/instructor/notifications"
                    className="block text-center text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar / Profile Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 focus:outline-none">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-purple-500 transition-colors"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-2 border-slate-700 group-hover:border-purple-400 transition-colors">
                {displayFirstName[0].toUpperCase()}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="bg-white text-gray-800 shadow-xl rounded-lg border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="font-bold text-sm truncate">{displayFirstName} {displayLastName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <Link 
                  to="/instructor/edit-profile" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  Edit Profile
                </Link>
                
                <Link
                  to={`/profile/${userId}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  View Public Profile
                </Link>

                <Link 
                  to="/instructor/notifications" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <Bell className="w-4 h-4 text-gray-500" />
                  Notifications
                </Link>

                <Link 
                  to="/instructor/security" 
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Account Security
                </Link>

                <div className="border-t my-1"></div>

                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                >
                  <LogOut className="w-4 h-4" /> 
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}