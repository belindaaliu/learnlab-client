import React, { useEffect, useState } from "react";
import api from "../../utils/Api";
import { CheckCircle, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/admin/courses");
        setCourses(response.data.data);
      } catch (err) {
        console.error("Failed to fetch admin courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-6">Loading courses...</div>;
  }

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const term = search.trim().toLowerCase();

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !term ||
      course.title?.toLowerCase().includes(term) ||
      `${course.Users?.first_name || ""} ${course.Users?.last_name || ""}`
        .trim()
        .toLowerCase()
        .includes(term);

    const matchesLevel =
      levelFilter === "all" ||
      (course.level && course.level.toLowerCase() === levelFilter);

    return matchesSearch && matchesLevel;
  });

  const levels = Array.from(
    new Set(
      courses
        .map((c) => c.level)
        .filter(Boolean)
        .map((lvl) => lvl.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Manage All Courses
        </h1>
        <p className="text-slate-600">
          Review, approve, and manage all platform courses
        </p>
      </div>

      {/* Filters & Search (wide like Users) */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by course title or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Level filter */}
          <div className="flex gap-2">
            <select
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">All levels</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Course Title
              </th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Instructor
              </th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Category
              </th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Level
              </th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Created
              </th>
              <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCourses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium">{course.title}</td>
                <td className="p-4">
                  {course.Users?.first_name} {course.Users?.last_name}
                </td>
                <td className="p-4">{course.Categories?.name}</td>
                <td className="p-4 text-sm capitalize">{course.level}</td>
                <td className="p-4 text-sm text-gray-500">
                  {formatDate(course.created_at)}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                  >
                    <Eye size={18} />
                  </button>
                  {/* <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <CheckCircle size={18} />
                  </button> */}
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td className="p-4 text-sm text-slate-600" colSpan={6}>
                  No courses match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourseList;

