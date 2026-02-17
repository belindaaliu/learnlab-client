import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/Api";
import { ArrowLeft, BookOpen, DollarSign, Users } from "lucide-react";

const AdminInstructorDetails = () => {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const instrRes = await api.get(`/admin/instructors/detail/${id}`);
        const instr = instrRes.data.data || instrRes.data;
        setInstructor(instr);

        const coursesRes = await api.get(`/admin/instructors/${id}/courses`);
        const courseList = coursesRes.data.data || coursesRes.data;
        setCourses(courseList || []);
      } catch (err) {
        console.error("Error loading instructor details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading instructor details...</p>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="p-8">
        <p className="text-red-600">Instructor not found.</p>
      </div>
    );
  }

  const totalCourses = courses.length;
  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.students_enrolled || c.enrollments_count || 0),
    0,
  );
  const totalRevenue = courses.reduce(
    (sum, c) => sum + (c.totalRevenue || 0),
    0,
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/admin/instructors"
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to instructors
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
          {instructor.photo_url && (
            <img
              src={instructor.photo_url}
              alt="profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {instructor.first_name} {instructor.last_name}
          </h1>
          <p className="text-sm text-gray-500">{instructor.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            Role: <span className="font-medium">{instructor.role}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Courses</p>
            <p className="text-xl font-bold text-gray-800">{totalCourses}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Total students</p>
            <p className="text-xl font-bold text-gray-800">
              {totalStudents.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Total revenue</p>
            <p className="text-xl font-bold text-gray-800">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            Instructor Courses
          </h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">
                Course
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">
                Students
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">
                Rating
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-sm text-gray-500 text-center"
                >
                  No courses found for this instructor.
                </td>
              </tr>
            )}
            {courses.map((course) => (
              <tr key={course.id.toString()}>
                <td className="px-6 py-3 text-sm">
                  <p className="font-semibold text-gray-800">{course.title}</p>
                  {course.subtitle && (
                    <p className="text-xs text-gray-500">{course.subtitle}</p>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-gray-700">
                  {(
                    course.students_enrolled ||
                    course.enrollments_count ||
                    0
                  ).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-sm text-gray-700">
                  {course.rating ? course.rating.toFixed(1) : "—"}
                </td>
                <td className="px-6 py-3 text-sm text-gray-700">
                  ${(course.totalRevenue || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInstructorDetails;
