import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';

const CategorySelector = ({ selectedId, onChange, error }) => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const wrapperRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem('accessToken');


  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);


  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);


  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const selectedCategory = categories.find(c => c.id.toString() === selectedId?.toString());


  const handleCreate = async () => {
    if (!searchTerm.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(
        `${API_URL}/categories`, 
        { name: searchTerm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newCat = res.data;
      setCategories([...categories, newCat]); 
      onChange({ target: { name: 'category_id', value: newCat.id } }); 
      setIsOpen(false);
      setSearchTerm("");
    } catch (err) {
      console.error("Error creating category:", err); 
      alert("Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
      

      <div 
        className={`w-full p-2 border rounded-lg flex justify-between items-center cursor-pointer bg-white ${error ? 'border-red-500' : 'border-gray-300'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
          {selectedCategory ? selectedCategory.name : "Select or create category..."}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </div>


      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          

          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              type="text"
              className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Search or type new..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>


          {loading ? (
            <div className="p-4 flex justify-center items-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2"/> Loading...
            </div>
          ) : (
            <>

              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-2 cursor-pointer text-sm hover:bg-purple-50 flex justify-between items-center ${selectedId?.toString() === cat.id.toString() ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-700'}`}
                  onClick={() => {
                    onChange({ target: { name: 'category_id', value: cat.id } });
                    setIsOpen(false);
                  }}
                >
                  {cat.name}
                  {selectedId?.toString() === cat.id.toString() && <Check className="w-4 h-4" />}
                </div>
              ))}

              {filteredCategories.length === 0 && searchTerm && (
                <div 
                  className="p-2 cursor-pointer text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2 border-t font-bold"
                  onClick={handleCreate}
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                  Create "{searchTerm}"
                </div>
              )}
              
              {filteredCategories.length === 0 && !searchTerm && (
                <div className="p-4 text-center text-xs text-gray-400">
                  Type to search or create
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;