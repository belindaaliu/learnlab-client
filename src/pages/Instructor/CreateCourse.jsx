import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Layout, DollarSign, BarChart, Globe, UploadCloud, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button'; 
import CategorySelector from '../../components/common/CategorySelector';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    level: 'beginner',
    thumbnail_url: '',
    language: 'English'
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/upload`, uploadData, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, thumbnail_url: res.data.url }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!formData.category_id) {
        alert("Please select a category.");
        return;
    }
    if (parseFloat(formData.price) < 0) {
        alert("Price cannot be negative!");
        return;
    }

    setLoading(true);
    try {

      const res = await axios.post(`${API_URL}/courses`, formData, config);
      
      console.log("Course Created Response:", res.data); 


      const newCourseId = res.data.id || res.data.data?.id;

      if (newCourseId) {

        navigate(`/instructor/courses/edit/${newCourseId}`);
      } else {
        throw new Error("Course created but ID is missing in response.");
      }
      
    } catch (error) {
      console.error("Failed to create course", error);
      alert(error.response?.data?.message || "Something went wrong creating the course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea 
              name="description"
              rows="3"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Brief summary..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
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
                  <option value="all_levels">All Levels</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <CategorySelector 
                 selectedId={formData.category_id}
                 onChange={handleChange}
               />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <select 
                  name="language"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Persian">Persian</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
              
              {uploadingImage ? (
                <div className="flex items-center gap-2 text-purple-600 font-bold">
                    <Loader2 className="animate-spin" /> Uploading...
                </div>
              ) : formData.thumbnail_url ? (
                <div className="relative w-full h-48">
                    <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-contain rounded" />
                    <button 
                        type="button" 
                        onClick={() => setFormData({...formData, thumbnail_url: ''})}
                        className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded-full shadow hover:bg-red-50"
                    >
                        ✕
                    </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
             <Button type="button" variant="outline" onClick={() => navigate('/instructor/courses')}>Cancel</Button>
             <Button type="submit" disabled={loading || uploadingImage}>
                {loading ? 'Creating...' : 'Create & Continue'}
             </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateCourse;