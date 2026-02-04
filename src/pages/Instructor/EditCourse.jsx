import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import CurriculumBuilder from '../../components/CurriculumBuilder';

const EditCourse = () => {
  const { id } = useParams();
  const token = localStorage.getItem('accessToken');
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State to hold the main form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    level: 'beginner',
    thumbnail_url: ''
  });

  // ✅ New state to maintain section list
  const [courseContent, setCourseContent] = useState([]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses/${id}`);
      const course = res.data;
      
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || '',
        category_id: course.category_id || '',
        level: course.level || 'beginner',
        thumbnail_url: course.thumbnail_url || ''
      });

      // ✅ Filling in the section list
      setCourseContent(course.CourseContent || []);

    } catch (error) {
      console.error("Error fetching course details:", error);
      alert("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`${API_URL}/courses/${id}`, formData, config);
      
      alert("Course updated successfully!");
            
    } catch (error) {
      console.error("Error updating course:", error);
      alert(error.response?.data?.message || "Failed to update course.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-10">Loading course data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/instructor/courses" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Course</h1>
      </div>

      {/* 1. Main Course Information Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">General Information</h2>
        
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all_levels">All Levels</option>
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail URL</label>
          <input
            type="text"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          {formData.thumbnail_url && (
            <img src={formData.thumbnail_url} alt="Preview" className="mt-4 h-40 object-cover rounded-lg border" />
          )}
        </div>

        {/* Hidden Category ID */}
        <div className="hidden">
           <input type="text" name="category_id" value={formData.category_id} readOnly />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="animate-spin w-5 h-5" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Update Course Info
              </>
            )}
          </button>
        </div>
      </form>

      {/* 2. ✅ Curriculum Builder Section */}
      <CurriculumBuilder 
        courseId={id} 
        sections={courseContent} 
        onUpdate={fetchCourse} 
      />
      
    </div>
  );
};

export default EditCourse;