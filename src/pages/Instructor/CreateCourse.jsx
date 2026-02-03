import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Layout, DollarSign, Image as ImageIcon, Tag, BarChart } from 'lucide-react';
import Button from '../../components/common/Button'; 

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '1',
    level: 'beginner',
    thumbnail_url: ''
  });

  const API_URL = "http://localhost:5000/api";
  const token = localStorage.getItem('accessToken');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.price) < 0) {
        alert("Price cannot be negative!");
        return;
    }

    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(`${API_URL}/courses`, formData, config);
      
      navigate('/instructor/courses');
      
    } catch (error) {
      console.error("Failed to create course", error);

      if (error.response && error.response.status === 401) {
          alert("Session expired. Please logout and login again.");
      } else {
          alert(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Course</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
            <div className="relative">
              <Layout className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                name="title"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g. Complete React Guide 2026"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description"
              rows="4"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="What will students learn?"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                  type="number" 
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="29.99"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <div className="relative">
                <BarChart className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <select 
                  name="level"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Category */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <select 
                  name="category_id"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  <option value="1">Development</option>
                  <option value="2">Business</option>
                  <option value="3">Design</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                name="thumbnail_url"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="https://example.com/image.jpg"
                value={formData.thumbnail_url}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty for default image.</p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
             <Button type="button" variant="outline" onClick={() => navigate('/instructor/courses')}>Cancel</Button>
             <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
             </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateCourse;