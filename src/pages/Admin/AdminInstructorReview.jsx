import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/Api';
import { FileText, Check, X } from 'lucide-react';

const AdminInstructorReview = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    api.get(`/admin/instructors/detail/${instructorId}`).then(res => setUser(res.data.data));
  }, [instructorId]);

  const handleReview = async (status) => {
    await api.post(`/admin/instructors/${instructorId}/review`, { status, adminComment: comment });
    navigate('/admin/instructors');
  };

  if (!user) return <div className="p-10">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Review Application</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8">
        <section className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <img src={user.photo_url} className="w-full aspect-square rounded-xl object-cover bg-gray-100" />
          </div>
          <div className="col-span-2">
            <h2 className="text-3xl font-bold">{user.first_name} {user.last_name}</h2>
            <p className="text-xl text-primary font-medium mb-4">{user.headline || "No Headline Provided"}</p>
            <div className="flex gap-2">
              <a href={user.resume_url} target="_blank" className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200">
                <FileText size={18} /> View Resume
              </a>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-2">Biography</h3>
          <p className="text-gray-600 leading-relaxed">{user.biography || "No biography provided."}</p>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-4">Application Decision</h3>
          <textarea 
            placeholder="Add a comment for the instructor (reason for rejection/notes for approval)..."
            className="w-full border rounded-xl p-4 h-32 mb-4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-4">
            <button 
              onClick={() => handleReview('approved')}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700"
            >
              <Check size={20} /> Approve Application
            </button>
            <button 
              onClick={() => handleReview('rejected')}
              className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100"
            >
              <X size={20} /> Reject Application
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminInstructorReview;