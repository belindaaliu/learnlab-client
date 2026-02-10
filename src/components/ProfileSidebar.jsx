import { NavLink } from "react-router-dom";

export default function ProfileSidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Links based on role
  const links =
    user?.role === "instructor"
      ? [
          { label: "Public profile", to: "/instructor/edit-profile" },
          { label: "Photo", to: "/instructor/edit-photo" },
          { label: "Account security", to: "/instructor/security" },
        ]
      : [
          { label: "Edit profile", to: "/student/edit-profile" },
          { label: "Photo", to: "/student/edit-photo" },
          { label: "Account security", to: "/student/security" },
          { label: "Subscriptions", to: "/student/subscriptions" },
        ];

  return (
    <div className="w-64 border-r bg-white h-full py-6 px-4">
      {/* Profile section */}
      <div className="flex flex-col items-center mb-8">
        {user?.photo_url ? (
          <img
            src={user.photo_url}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
            {getInitials(`${user?.first_name} ${user?.last_name}`)}
          </div>
        )}

        <h3 className="mt-3 text-lg font-semibold text-gray-900">
          {user?.first_name} {user?.last_name}
        </h3>
      </div>

      <h2 className="text-lg font-semibold mb-6">Settings</h2>

      <nav className="flex flex-col gap-2">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
