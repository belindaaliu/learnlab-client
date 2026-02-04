import React, { useEffect, useState } from 'react';
import api from '../../utils/Api';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/admin/courses');
        // Because we used { success: true, data: [...] } in the controller:
        setCourses(response.data.data);
      } catch (err) {
        console.error("Failed to fetch admin courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage All Courses</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Course Title</th>
              <th className="p-4">Instructor</th>
              <th className="p-4">Category</th>
              <th className="p-4">Level</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} className="border-t border-gray-100">
                <td className="p-4 font-medium">{course.title}</td>
                <td className="p-4">{course.Users?.first_name} {course.Users?.last_name}</td>
                <td className="p-4">{course.Categories?.name}</td>
                <td className="p-4 text-sm capitalize">{course.level}</td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="p-2 hover:bg-blue-50 text-blue-600 rounded"><Eye size={18} /></button>
                  <button className="p-2 hover:bg-green-50 text-green-600 rounded"><CheckCircle size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourseList;