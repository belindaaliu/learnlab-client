import React, { useEffect, useState } from 'react';
import api from '../../utils/Api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Users, BookOpen, DollarSign, Clock } from 'lucide-react';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard-stats')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

  // Data for the Pie Chart (User Distribution)
  const userData = [
    { name: 'Students', value: data.metrics.students },
    { name: 'Instructors', value: data.metrics.instructors },
  ];
  const COLORS = ['#8884d8', '#82ca9d'];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Revenue" value={`$${data.metrics.revenue}`} icon={<DollarSign/>} color="bg-green-500" />
        <StatCard title="Total Courses" value={data.metrics.courses} icon={<BookOpen/>} color="bg-blue-500" />
        <StatCard title="Pending Approvals" value={data.metrics.pendingApprovals} icon={<Clock/>} color="bg-yellow-500" />
        <StatCard title="Total Students" value={data.metrics.students} icon={<Users/>} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- REVENUE/ACTIVITY CHART --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Enrollment Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.recentEnrollments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="enrolled_at" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="id" name="Enrollment ID" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- USER DISTRIBUTION PIE CHART --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">User Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             {userData.map((entry, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                 <span className="text-sm text-gray-600 font-medium">{entry.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-xl text-white ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default AdminAnalytics;