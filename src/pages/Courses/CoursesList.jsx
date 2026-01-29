import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, X, Loader2 } from "lucide-react";
import CourseCard from '../../components/CourseCard';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// We will keep the categories fixed for now (later we can get them from the API)
const CATEGORIES = ["All", "Development", "Business", "Design"];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating_desc" },
];

const CoursesList = () => {
  // --- STATE ---
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    priceRange: [], 
    sortBy: "newest"
  });

  // --- REAL BACKEND API CALL ---
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      
      try {

        const queryParams = new URLSearchParams();
        
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.category !== "All") queryParams.append("category", filters.category);
        if (filters.sortBy) queryParams.append("sort", filters.sortBy);


        const response = await fetch(`http://localhost:5000/api/courses?${queryParams.toString()}`);
        
        if (!response.ok) throw new Error("Failed to fetch courses");
        
        const data = await response.json();
        
        // Note: Since the backend doesn't have a price filter yet, here we will apply the price filter on the client side.
        let result = data;
        if (filters.priceRange.length > 0) {
          result = result.filter(c => {

            const price = Number(c.price); 
            if (filters.priceRange.includes('free') && price === 0) return true;
            if (filters.priceRange.includes('under_20') && price > 0 && price < 20) return true;
            if (filters.priceRange.includes('mid') && price >= 20 && price <= 100) return true;
            if (filters.priceRange.includes('high') && price > 100) return true;
            return false;
          });
        }

        setCourses(result);
      } catch (err) {
        console.error("API Error:", err);
        setError("Could not load courses. Is the server running?");
      } finally {
        setIsLoading(false);
      }
    };


    const timeoutId = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(timeoutId);

  }, [filters]); 

  // --- HANDLERS ---
  const handlePriceChange = (value) => {
    setFilters(prev => {
      const current = prev.priceRange;
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, priceRange: updated };
    });
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
    setShowSortMenu(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8" onClick={() => setShowSortMenu(false)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
            <p className="text-gray-500 mt-1">Found {courses.length} results</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <div className="w-full md:w-80">
              <Input 
                placeholder="Search (e.g. React)..." 
                icon={Search} 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <Button variant="outline" onClick={() => setShowSortMenu(!showSortMenu)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" /> 
                Sort
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${filters.sortBy === opt.value ? 'text-primary font-bold bg-purple-50' : 'text-gray-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center justify-center">
            {error}
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR FILTERS */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" /> Categories
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.category === cat 
                        ? "bg-primary text-white font-medium shadow-md shadow-purple-200" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Price</h3>
              <div className="space-y-3">
                {[
                  { label: 'Free', value: 'free' },
                  { label: 'Under $20', value: 'under_20' },
                  { label: '$20 - $100', value: 'mid' },
                  { label: '$100+', value: 'high' }
                ].map(item => (
                  <label key={item.value} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                    <input 
                      type="checkbox" 
                      checked={filters.priceRange.includes(item.value)}
                      onChange={() => handlePriceChange(item.value)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RESULTS GRID */}
          <div className="lg:col-span-3">
             {/* Tags area omitted for brevity, same as before */}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
                <p className="text-gray-500">Try adjusting your filters.</p>
                <button 
                  onClick={() => setFilters({ search: "", category: "All", priceRange: [], sortBy: "newest" })}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesList;