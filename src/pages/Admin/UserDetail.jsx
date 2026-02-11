import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  DollarSign, 
  BookOpen,
  UserCog,
  Trash2,
  Shield
} from 'lucide-react';
import axios from 'axios';
import Toast from '../../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(response.data.data);
      setSelectedRole(response.data.data.role);
    } catch (error) {
      console.error('Error fetching user:', error);
      showToast('Failed to load user details', 'error');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`${API_URL}/admin/users/${userId}/role`, 
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setShowRoleModal(false);
      showToast(`User role updated to ${selectedRole}`, 'success');
      fetchUserDetail();
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      showToast('User deleted successfully', 'success');
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">User not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Users
      </button>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-2xl">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="text-slate-400" size={16} />
                <span className="text-slate-600">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowRoleModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <UserCog size={18} />
              Change Role
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="text-purple-600" size={20} />
              <span className="text-sm text-slate-600">Role</span>
            </div>
            <p className="text-xl font-bold text-slate-900 capitalize">{user.role}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="text-blue-600" size={20} />
              <span className="text-sm text-slate-600">Enrollments</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{user.stats?.enrollmentCount || 0}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="text-green-600" size={20} />
              <span className="text-sm text-slate-600">Total Spent</span>
            </div>
            <p className="text-xl font-bold text-slate-900">${(user.stats?.totalSpent || 0).toFixed(2)}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-orange-600" size={20} />
              <span className="text-sm text-slate-600">Member Since</span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      {user.Enrollments && user.Enrollments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Enrolled Courses</h2>
          <div className="space-y-3">
            {user.Enrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{enrollment.Courses.title}</p>
                  <p className="text-sm text-slate-600">
                    Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  ${enrollment.Courses.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Change User Role</h3>
            <div className="space-y-2 mb-6">
              {['student', 'instructor', 'admin'].map((role) => (
                <label key={role} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="capitalize font-medium">{role}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete User</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;