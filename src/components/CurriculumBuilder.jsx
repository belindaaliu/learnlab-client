import React, { useState } from 'react';
import axios from 'axios';
import { Plus, GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';

const CurriculumBuilder = ({ courseId, sections, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState(null); 
  const [editTitle, setEditTitle] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem('accessToken');

  // --- 1. ADD SECTION ---
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/courses/${courseId}/sections`, 
        { title: newSectionTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewSectionTitle("");
      setIsAdding(false);
      onUpdate();
    } catch (error) {
        console.error("Failed to add section:", error);
      alert("Error adding section");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. DELETE SECTION ---
  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    try {
      await axios.delete(
        `${API_URL}/courses/${courseId}/sections/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete section");
    }
  };

  // --- 3. START EDITING ---
  const startEditing = (section) => {
    setEditingId(section.id);
    setEditTitle(section.title);
  };

  // --- 4. SAVE EDIT ---
  const handleUpdateSection = async () => {
    if (!editTitle.trim()) return;

    try {
      await axios.put(
        `${API_URL}/courses/${courseId}/sections/${editingId}`,
        { title: editTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update section name");
    }
  };

  // Filtering sections
  const onlySections = sections.filter(item => item.type === 'section');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Course Curriculum</h2>
      </div>

      <div className="space-y-4 mb-6">
        {onlySections.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
            No sections yet. Start by adding one!
          </div>
        )}

        {onlySections.map((section) => (
          <div key={section.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between group transition-all hover:border-purple-200 hover:shadow-sm">
            
            <div className="flex items-center gap-3 flex-1">
              <GripVertical className="text-gray-400 cursor-move" size={20} />
              
              {editingId === section.id ? (
                <div className="flex items-center gap-2 w-full max-w-md">
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 p-2 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus
                  />
                  <button onClick={handleUpdateSection} className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <span className="font-bold text-gray-800">Section: {section.title}</span>
              )}
            </div>

            {editingId !== section.id && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => startEditing(section)}
                   className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600 transition"
                   title="Edit Name"
                 >
                   <Edit2 size={16} />
                 </button>
                 <button 
                   onClick={() => handleDeleteSection(section.id)}
                   className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-red-600 transition"
                   title="Delete Section"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Section Form */}
      {isAdding ? (
        <form onSubmit={handleAddSection} className="bg-purple-50 p-4 rounded-xl border border-purple-100 animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            autoFocus
            placeholder="Enter section title (e.g., Introduction)"
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-purple-500"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
            >
              {loading ? "Adding..." : "Add Section"}
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition"
        >
          <Plus size={20} /> Add Section
        </button>
      )}
    </div>
  );
};

export default CurriculumBuilder;