import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Save, ArrowLeft, Plus, Trash2, 
  BookOpen, Users, FileText, Loader2 
} from "lucide-react";
import CategorySelector from '../../components/common/CategorySelector';

const EditCourse = () => {

  const params = useParams();
  const courseId = params.courseId || params.id; 

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    thumbnail_url: "",
    long_description: "",
    language: "English",
    requirements: [""],
    target_audience: [""]
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("accessToken");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {

    if (!courseId || courseId === 'undefined') return;

    const fetchData = async () => {
      try {
        console.log("Fetching course with ID:", courseId);

        const res = await axios.get(`${API_URL}/courses/${courseId}`, config);
        const course = res.data;


        let parsedReqs = [];
        let parsedAudience = [];
        try { parsedReqs = course.requirements ? JSON.parse(course.requirements) : [""]; } catch { parsedReqs = [""]; }
        try { parsedAudience = course.target_audience ? JSON.parse(course.target_audience) : [""]; } catch { parsedAudience = [""]; }

        setFormData({
          title: course.title,
          description: course.description || "",
          price: course.price,
          category_id: course.category_id ? parseInt(course.category_id) : "", 
          thumbnail_url: course.thumbnail_url || "",
          long_description: course.long_description || "",
          language: course.language || "English",
          requirements: parsedReqs.length ? parsedReqs : [""],
          target_audience: parsedAudience.length ? parsedAudience : [""]
        });

      } catch (error) {
        console.error("Error fetching data:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, value, field) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (index, field) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cleanRequirements = formData.requirements.filter(item => item.trim() !== "");
      const cleanAudience = formData.target_audience.filter(item => item.trim() !== "");

      const payload = {
        ...formData,
        requirements: cleanRequirements,
        target_audience: cleanAudience,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id)
      };

      await axios.put(`${API_URL}/courses/${courseId}`, payload, config);
      alert("Course updated successfully!");
      navigate("/instructor/courses");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update course.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading course data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/instructor/courses")} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Course: {formData.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- BASIC INFO --- */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
            <BookOpen size={20} className="text-purple-600"/> Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
              <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <CategorySelector 
                selectedId={formData.category_id}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Language</label>
              <select name="language" value={formData.language} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Persian">Persian</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Short Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full p-2 border rounded text-sm" placeholder="Brief summary for course card..." />
          </div>
        </div>

        {/* --- DETAILED DESCRIPTION --- */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
            <FileText size={20} className="text-purple-600"/> Detailed Description
          </h3>
          <p className="text-xs text-gray-500">This will be shown on the course landing page. You can use simple HTML tags.</p>
          <textarea 
            name="long_description" 
            value={formData.long_description} 
            onChange={handleChange} 
            rows={8} 
            className="w-full p-3 border rounded font-mono text-sm" 
            placeholder="Write a detailed description about your course..." 
          />
        </div>

        {/* --- REQUIREMENTS (Dynamic List) --- */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
            <CheckCircleIcon /> Requirements / What you'll learn
          </h3>
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <input 
                value={req} 
                onChange={(e) => handleArrayChange(index, e.target.value, "requirements")}
                className="flex-1 p-2 border rounded"
                placeholder={`Requirement ${index + 1}`}
              />
              <button type="button" onClick={() => removeArrayItem(index, "requirements")} className="p-2 text-red-500 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("requirements")} className="text-sm font-bold text-purple-600 flex items-center gap-1 hover:underline">
            <Plus size={16} /> Add Requirement
          </button>
        </div>

        {/* --- TARGET AUDIENCE (Dynamic List) --- */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
            <Users size={20} className="text-purple-600"/> Target Audience
          </h3>
          {formData.target_audience.map((aud, index) => (
            <div key={index} className="flex gap-2">
              <input 
                value={aud} 
                onChange={(e) => handleArrayChange(index, e.target.value, "target_audience")}
                className="flex-1 p-2 border rounded"
                placeholder={`Audience ${index + 1}`}
              />
              <button type="button" onClick={() => removeArrayItem(index, "target_audience")} className="p-2 text-red-500 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("target_audience")} className="text-sm font-bold text-purple-600 flex items-center gap-1 hover:underline">
            <Plus size={16} /> Add Audience
          </button>
        </div>

        {/* --- SUBMIT --- */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default EditCourse;