import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/Api';
import { ExternalLink, UserCheck, UserX, Clock } from 'lucide-react';

const AdminInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    api.get(`/admin/instructors?status=${filter}`).then(res => setInstructors(res.data.data));
  }, [filter]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-orange-100 text-orange-600",
      approved: "bg-green-100 text-green-600",
      rejected: "bg-red-100 text-red-600"
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Instructor Management</h1>
        <select 
          className="border rounded-lg p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All Instructors</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-sm">Instructor</th>
              <th className="px-6 py-4 font-semibold text-sm">Submitted</th>
              <th className="px-6 py-4 font-semibold text-sm">Status</th>
              <th className="px-6 py-4 font-semibold text-sm">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {instructors.map((inst) => (
              <tr key={inst.id.toString()}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {inst.photo_url && <img src={inst.photo_url} alt="profile" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold">{inst.first_name} {inst.last_name}</p>
                    <p className="text-xs text-gray-500">{inst.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(inst.instructor_application_submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{getStatusBadge(inst.instructor_application_status)}</td>
                <td className="px-6 py-4">
                  <Link 
                    to={`/admin/instructors/${inst.id}/review`}
                    className="flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    View Application <ExternalLink size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInstructors;