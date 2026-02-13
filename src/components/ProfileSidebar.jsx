import { NavLink } from "react-router-dom";
import { 
  User, 
  Camera, 
  Shield, 
  CreditCard,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react";

export default function ProfileSidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Get user's full name or fallback
  const fullName = user?.first_name && user?.last_name 
    ? `${user?.first_name} ${user?.last_name}`
    : user?.first_name || user?.last_name || "User";

  // Get user role badge
  const getRoleBadge = () => {
    switch(user?.role) {
      case 'instructor':
        return <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">Instructor</span>;
      case 'admin':
        return <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">Admin</span>;
      default:
        return <span className="px-2 py-1 bg-gradient-to-r from-primary/10 to-purple-100 text-primary rounded-full text-xs font-medium border border-primary/20">Student</span>;
    }
  };

  // Links based on role with icons
  const links =
    user?.role === "instructor"
      ? [
          { label: "Public Profile", to: "/instructor/edit-profile", icon: User },
          { label: "Profile Photo", to: "/instructor/edit-photo", icon: Camera },
          { label: "Account Security", to: "/instructor/security", icon: Shield },
        ]
      : [
          { label: "Edit Profile", to: "/student/edit-profile", icon: User },
          { label: "Profile Photo", to: "/student/edit-photo", icon: Camera },
          { label: "Account Security", to: "/student/security", icon: Shield },
          { label: "Subscriptions", to: "/student/subscription", icon: CreditCard },
        ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-full min-h-screen flex flex-col sticky top-0">
      
      {/* Profile Card */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
        <div className="flex flex-col items-center text-center">
          {/* Avatar with gradient ring */}
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={fullName}
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
                {getInitials(fullName)}
              </div>
            )}
            
            {/* Camera icon overlay on hover */}
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition group-hover:scale-110">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              {fullName}
            </h3>
            <div className="flex items-center justify-center gap-2">
              {getRoleBadge()}
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                ID: {user?.id?.toString().slice(0, 8) || '••••'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {user?.email || 'No email provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Settings
          </h2>
        </div>

        <nav className="flex flex-col gap-1.5">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-purple-100 text-primary border border-primary/20 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <div className={`
                  p-1.5 rounded-lg transition-colors
                  ${({ isActive }) => isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-white'
                  }
                `}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`
                w-4 h-4 transition-all
                ${({ isActive }) => isActive 
                  ? 'text-primary translate-x-0.5' 
                  : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5'
                }
              `} />
            </NavLink>
          ))}
        </nav>

        {/* Account Status */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Account Status</p>
                <p className="text-sm font-semibold text-gray-900">Active</p>
                <p className="text-xs text-gray-500 mt-1">
                  Member since {new Date(user?.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  }) || '2024'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}