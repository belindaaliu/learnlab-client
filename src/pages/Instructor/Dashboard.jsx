import React from 'react';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Instructor Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 text-center py-20">
        <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
        <Link to="/instructor/courses/create" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700">
          Create Your First Course
        </Link>
      </div>
    </div>
  );
};
export default InstructorDashboard;