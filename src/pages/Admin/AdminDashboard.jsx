import React, { useEffect, useState } from 'react';
import { Users, BookOpen, DollarSign, Clock, CheckCircle } from 'lucide-react';
import api from '../../utils/Api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard-stats').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="p-8">Loading Overview...</div>;

  const stats = [
    { label: 'Total Revenue', value: `$${data.metrics.revenue}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Active Students', value: data.metrics.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Courses', value: data.metrics.courses, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Pending Apps', value: data.metrics.pendingApprovals, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-bold text-lg">Recent Enrollments</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentEnrollments.map((enr) => (
                <tr key={enr.id}>
                  <td className="px-6 py-4 font-medium">{enr.Users.first_name} {enr.Users.last_name}</td>
                  <td className="px-6 py-4 text-gray-600">{enr.Courses.title}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(enr.enrolled_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Shortcuts */}
        <div className="space-y-6">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-primary/20">
            <h3 className="font-bold text-xl mb-2">Platform Pulse</h3>
            <p className="opacity-80 text-sm">You have {data.metrics.pendingApprovals} instructors waiting for review.</p>
            <button className="mt-4 bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm">
              Review Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;