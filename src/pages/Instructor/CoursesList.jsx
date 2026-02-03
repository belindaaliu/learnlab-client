import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';

const InstructorCoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('accessToken'); 
  const API_URL = "http://localhost:5000/api";

  const defaultImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";


  useEffect(() => {
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/courses/instructor/my-courses`, config);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      

      await axios.delete(`${API_URL}/courses/${courseId}`, config);
      

      setCourses(courses.filter(course => course.id !== courseId));
      
      alert("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your courses...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <Link 
          to="/instructor/courses/create" 
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4" /> New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
           <div className="mb-4">
             <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
               <Plus className="w-8 h-8" />
             </div>
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Create your first course</h3>
           <p className="text-gray-500 mb-6">Share your knowledge and help students learn new skills.</p>
           <Link to="/instructor/courses/create" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 inline-block">
             Create Course
           </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b">
                <th className="p-4">Course</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                          
                          src={course.thumbnail_url || defaultImage} 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = defaultImage; 
                          }}
                          alt={course.title} 
                          className="w-16 h-10 object-cover rounded border border-gray-200 shadow-sm" 
                      />
                      <span className="font-bold text-gray-800">{course.title}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">${course.price}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Published</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">

                        <Link to={`/courses/${course.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                           <Eye className="w-4 h-4"/>
                        </Link>
                        
                        <button className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded">
                           <Link 
                                to={`/instructor/courses/edit/${course.id}`} 
                                className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                                title="Edit Course"
                              >
                                <Edit className="w-4 h-4"/>
                            </Link>
                        </button>
                        
                        <button 
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete Course"
                        >
                           <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesList;