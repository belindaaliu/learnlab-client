import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { DollarSign, Users, TrendingUp, Calendar, Loader2 } from 'lucide-react';

const InstructorPerformance = () => {
  const [loading, setLoading] = useState(true);
  
  // Single state for all data
  const [data, setData] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalViews: 0,
    chartData: []
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/courses/instructor/stats`, config);
        
        setData(res.data);
      } catch (error) {
        console.error("Error fetching performance stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-purple-600">
        <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
      
      {/* Title Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Performance Analytics</h1>
          <p className="text-gray-500 mt-1">Track your revenue, students growth, and course insights.</p>
        </div>
        
        {/* Date Filter (Visual Only - Backend currently defaults to 6 months) */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded">6 Months</button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">${data.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                </div>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" /> <span>Real-time</span>
            </div>
        </div>

        {/* Enrollments Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Total Enrollments</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{data.totalStudents}</h3>
                </div>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Users className="w-6 h-6" />
                </div>
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" /> <span>Growing</span>
            </div>
        </div>

        {/* Rating Card (Static for now as Review system logic is separate) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Course Rating</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">4.8</h3>
                </div>
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                </div>
            </div>
            <p className="text-gray-400 text-sm">Average rating</p>
        </div>
      </div>

      {/* 2. Main Chart: Revenue Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend (Last 6 Months)</h3>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#7C3AED" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Secondary Chart: Course Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Enrollments</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                        <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px' }} />
                        <Bar dataKey="students" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="bg-purple-50 p-4 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-2">Detailed Reports?</h3>
             <p className="text-gray-500 mb-6 text-sm max-w-xs">
                Download a detailed CSV report of all your transactions and student enrollments for accounting.
             </p>
             <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition">
                Download Report (CSV)
             </button>
          </div>
      </div>

    </div>
  );
};

export default InstructorPerformance;