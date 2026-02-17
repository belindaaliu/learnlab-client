import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, UploadCloud, Loader2, RotateCcw, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const InstructorCoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived'
  
  const [uploadingId, setUploadingId] = useState(null);

  const token = localStorage.getItem('accessToken'); 
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const defaultImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [token, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'active') {
        const res = await axios.get(`${API_URL}/courses/instructor/my-courses`, config);
        setCourses(res.data);
      } else {
        const res = await axios.get(`${API_URL}/courses/instructor/archived`, config);
        setArchivedCourses(res.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  // 1. Soft Delete (Archive)
  const handleArchive = (courseId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-sm text-white">Move this course to trash?</span>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-xs transition"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`${API_URL}/courses/${courseId}`, config);
                setCourses(courses.filter(c => c.id !== courseId));
                toast.success("Course moved to trash!");
              } catch (error) {
                console.error("Archive error:", error);
                toast.error("Failed to archive");
              }
            }} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs transition"
          >
            Yes, Trash it
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  // 2. Restore
  const handleRestore = async (courseId) => {
    try {
      await axios.put(`${API_URL}/courses/${courseId}/restore`, {}, config);
      setArchivedCourses(archivedCourses.filter(c => c.id !== courseId));
      toast.success("Course restored to Active list!");
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Failed to restore");
    }
  };

  // 3. Permanent Delete
  const handlePermanentDelete = (courseId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-sm text-red-400">⚠️ PERMANENTLY delete?</span>
        <span className="text-xs text-gray-300">This cannot be undone!</span>
        <div className="flex gap-2 justify-end mt-1">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-xs transition"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`${API_URL}/courses/${courseId}/permanent`, config);
                setArchivedCourses(archivedCourses.filter(c => c.id !== courseId));
                toast.success("Course permanently deleted.");
              } catch (error) {
                console.error("Delete error:", error);
                toast.error("Failed to delete permanently");
              }
            }} 
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold transition"
          >
            Delete Forever
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };
  
  // 4. Image Upload (Corrected Logic)
  const handleImageUpload = async (e, courseId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(courseId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload to server/S3
      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = uploadRes.data.url;

      // 2. Update course in DB
      await axios.put(`${API_URL}/courses/${courseId}`, { thumbnail_url: imageUrl }, config);

      // 3. Update UI state locally
      setCourses(prevCourses => prevCourses.map(course => 
        course.id === courseId ? { ...course, thumbnail_url: imageUrl } : course
      ));

      toast.success("Course thumbnail updated successfully!");

    } catch (error) {
      console.error("Thumbnail upload failed:", error);
      toast.error("Failed to upload image.");
    } finally {
      setUploadingId(null);
      e.target.value = null; // Reset input
    }
  };

  if (loading && courses.length === 0 && archivedCourses.length === 0) 
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600"/></div>;

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Header & Tabs */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <Link to="/instructor/courses/create" className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
          <Plus className="w-4 h-4" /> New Course
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setViewMode('active')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            viewMode === 'active' 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Courses
        </button>
        <button 
          onClick={() => setViewMode('archived')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            viewMode === 'archived' 
              ? 'border-red-500 text-red-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Trash2 className="w-4 h-4"/> Trash / Archived
        </button>
      </div>

      {/* CONTENT: ACTIVE LIST */}
      {viewMode === 'active' && (
        courses.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No active courses found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
                <tr>
                  <th className="p-4">Course</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Image & Upload Logic */}
                        <div className="relative group w-24 h-16 shrink-0 rounded border border-gray-200 overflow-hidden bg-gray-100">
                            <img 
                              src={course.thumbnail_url || defaultImage} 
                              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                              alt={course.title} 
                              className={`w-full h-full object-cover transition-opacity ${uploadingId === course.id ? 'opacity-50' : ''}`} 
                            />
                            
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              {uploadingId === course.id ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              ) : (
                                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-white">
                                  <UploadCloud className="w-6 h-6 mb-1" />
                                  <span className="text-[10px] font-bold">Change</span>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => handleImageUpload(e, course.id)}
                                  />
                                </label>
                              )}
                            </div>
                        </div>

                        <span className="font-bold text-gray-800 text-sm">{course.title}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-sm">${course.price}</td>
                    <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {course.student_count || 0}
                      </span>
                      <button
                        onClick={() => navigate(`/instructor/courses/${course.id}/students`)}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Students
                      </button>
                    </div>
                  </td>
                    <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Active</span></td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/instructor/courses/edit/${course.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4"/></Link>
                        <button onClick={() => handleArchive(course.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Move to Trash"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* CONTENT: ARCHIVED LIST */}
      {viewMode === 'archived' && (
        archivedCourses.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Trash is empty.</p>
          </div>
        ) : (
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-100 overflow-hidden">
            <div className="p-4 bg-red-100 text-red-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4"/> Items in trash will be permanently deleted after 30 days.
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-red-50 text-gray-600 text-xs uppercase border-b border-red-200">
                <tr>
                  <th className="p-4">Course</th>
                  <th className="p-4">Days Left</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedCourses.map(course => (
                  <tr key={course.id} className="border-b border-red-100 hover:bg-red-100/50">
                    <td className="p-4 flex items-center gap-3">
                        <img src={course.thumbnail_url || defaultImage} className="w-16 h-10 rounded opacity-50 grayscale" />
                        <span className="text-gray-600 text-sm line-through">{course.title}</span>
                    </td>
                    <td className="p-4 text-sm text-red-600 font-bold">{course.daysLeft} days</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleRestore(course.id)} className="px-3 py-1 bg-white border border-green-300 text-green-700 text-xs rounded hover:bg-green-50 flex items-center gap-1">
                            <RotateCcw className="w-3 h-3"/> Restore
                        </button>
                        <button onClick={() => handlePermanentDelete(course.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                            Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

    </div>
  );
};

export default InstructorCoursesList;