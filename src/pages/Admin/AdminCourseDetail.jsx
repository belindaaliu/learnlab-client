import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/Api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { toast } from "react-hot-toast";

const AdminCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentFilter, setStudentFilter] = useState("all");
  const hasFetchedRef = useRef(false);

  const [formData, setFormData] = useState({
    price: "",
    discount_active: false,
    discount_type: "",
    discount_value: "",
    discount_starts_at: "",
    discount_ends_at: "",
  });

  // Date range for filtering stats
  const [range, setRange] = useState({
    start: "",
    end: "",
  });

  const fetchDetail = async (opts = {}) => {
    try {
      const params = {};
      if (opts.start && opts.end) {
        params.start = opts.start;
        params.end = opts.end;
      }

      const res = await api.get(`/admin/courses/${courseId}/detail`, {
        params,
      });

      const { course, stats, enrolledStudents } = res.data.data;
      setCourse(course);
      setStats(stats);
      setStudents(enrolledStudents || []);

      setFormData({
        price: course.price ?? 0,
        discount_active: !!course.discount_active,
        discount_type: course.discount_type || "",
        discount_value: course.discount_value ?? "",
        discount_starts_at: course.discount_starts_at
          ? course.discount_starts_at.slice(0, 16)
          : "",
        discount_ends_at: course.discount_ends_at
          ? course.discount_ends_at.slice(0, 16)
          : "",
      });
    } catch (err) {
      console.error("Admin course detail fetch error", err);
      toast.error("Failed to load course details");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [courseId]);

  useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  fetchDetail();
}, [courseId]);

  const filteredStudents = students.filter((s) => {
    if (studentFilter === "completed") return s.status === "completed";
    if (studentFilter === "in_progress") return s.status === "in_progress";
    if (studentFilter === "not_started") return s.status === "not_started";
    return true;
  });

  const handleApplyRange = () => {
    if (range.start && range.end && range.start > range.end) {
      toast.error("Start date must be before end date");
      return;
    }

    if (range.start && range.end) {
      fetchDetail({ start: range.start, end: range.end });
    } else {
      fetchDetail();
    }
  };

  const handleSave = async () => {
    if (!course) return;
    setSaving(true);
    try {
      const payload = {
        price: Number(formData.price),
        discount_active: !!formData.discount_active,
        discount_type: formData.discount_active
          ? formData.discount_type || null
          : null,
        discount_value:
          formData.discount_active && formData.discount_value !== ""
            ? Number(formData.discount_value)
            : null,
        discount_starts_at:
          formData.discount_active && formData.discount_starts_at
            ? new Date(formData.discount_starts_at).toISOString()
            : null,
        discount_ends_at:
          formData.discount_active && formData.discount_ends_at
            ? new Date(formData.discount_ends_at).toISOString()
            : null,
      };

      await api.put(`/admin/courses/${course.id}`, payload);

      toast.success("Course pricing updated");
    } catch (err) {
      console.error("Admin course save error", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!course) return <div className="p-6">Loading course...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate("/admin/courses")}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← Back to course list
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-gray-500">
          {course.Users?.first_name} {course.Users?.last_name} ·{" "}
          {course.Categories?.name}
        </p>
      </div>

      {/* Date range filter for stats */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
              From
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={range.start}
              onChange={(e) =>
                setRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
              To
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={range.end}
              onChange={(e) =>
                setRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApplyRange}>Apply</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRange({ start: "", end: "" });
              fetchDetail();
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-gray-500 uppercase font-bold">
              Enrolled students
            </p>
            <p className="text-2xl font-bold">{stats.enrollmentCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-gray-500 uppercase font-bold">
              Total revenue
            </p>
            <p className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-gray-500 uppercase font-bold">
              Current price
            </p>
            <p className="text-lg font-semibold">
              ${stats.pricing.finalPrice.toFixed(2)}{" "}
              {stats.pricing.finalPrice !== stats.pricing.originalPrice && (
                <span className="text-xs text-gray-400 line-through ml-1">
                  ${stats.pricing.originalPrice.toFixed(2)}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="text-lg font-bold">Pricing & Discount</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Base Price (CAD)"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
              Enable Discount
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.discount_active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_active: e.target.checked,
                  })
                }
              />
              <span>Active</span>
            </label>
          </div>
        </div>

        {formData.discount_active && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                Discount Type
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value,
                  })
                }
              >
                <option value="">Select type</option>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>

            <Input
              label="Discount Value"
              type="number"
              value={formData.discount_value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_value: e.target.value,
                })
              }
            />

            <Input
              label="Starts At"
              type="datetime-local"
              value={formData.discount_starts_at}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_starts_at: e.target.value,
                })
              }
            />
            <Input
              label="Ends At"
              type="datetime-local"
              value={formData.discount_ends_at}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_ends_at: e.target.value,
                })
              }
            />
          </div>
        )}

        <Button onClick={handleSave} isLoading={saving}>
          Save Pricing
        </Button>
      </div>

      {/* Enrolled students table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Enrolled Students</h2>
          <select
            className="border rounded-lg px-3 py-1 text-sm"
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 font-semibold text-xs text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-4 py-2 font-semibold text-xs text-gray-500 uppercase">
                  Enrolled At
                </th>
                <th className="px-4 py-2 font-semibold text-xs text-gray-500 uppercase">
                  Progress
                </th>
                <th className="px-4 py-2 font-semibold text-xs text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-center text-gray-500 text-sm"
                  >
                    No students found for this filter.
                  </td>
                </tr>
              )}
              {filteredStudents.map((s) => (
                <tr key={s.id.toString()}>
                  <td className="px-4 py-2">
                    <p className="font-semibold">
                      {s.user.first_name} {s.user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{s.user.email}</p>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {s.enrolled_at
                      ? new Date(s.enrolled_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {s.totalLessons > 0
                      ? `${s.completedLessons}/${s.totalLessons} lessons`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        s.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : s.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDetail;
