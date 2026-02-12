import { useEffect, useState } from "react";
import axios from "axios";
import ProfileSidebar from "../../components/ProfileSidebar";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Link as LinkIcon,
  X,
  Plus,
  Save,
  Loader2,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Download
} from "lucide-react";

export default function EditProfile() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    headline: "",
    biography: "",
    occupation: "",
    field_of_learning: "",
    skills: [],
    interests: [],
    resume_url: "",
    website_url: "",
  });

  const [applicationStatus, setApplicationStatus] = useState(null); // 'pending', 'approved', 'rejected', or null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token || localStorage.getItem("accessToken");
  const isInstructor = user?.roles?.includes('instructor') || user?.role === 'instructor';

  // Toast helper
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Generate display name from resume URL
  const getResumeDisplayName = () => {
    if (!form.resume_url) return null;
    const ext = form.resume_url.split('.').pop();
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return `${form.first_name || 'User'}_${form.last_name || 'Profile'}_Resume_${formattedDate}.${ext}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;

        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          headline: data.headline || "",
          biography: data.biography || "",
          occupation: data.occupation || "",
          field_of_learning: data.field_of_learning || "",
          skills: data.skills || [],
          interests: data.interests || [],
          resume_url: data.resume_url || "",
          website_url: data.website_url || "",
        });

        // Fetch instructor application status if user is instructor
        if (isInstructor) {
          fetchApplicationStatus();
        }
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    const fetchApplicationStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/instructor-applications/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplicationStatus(res.data.status);
      } catch (err) {
        console.error("Error fetching application status:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a PDF or Word document', 'error');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size should be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await axios.post(`${API_URL}/users/upload-resume`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      setForm({ ...form, resume_url: res.data.data.resume_url });
      showToast('Resume uploaded successfully!');
      
    } catch (err) {
      console.error("Upload error:", err);
      showToast('Failed to upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/download-resume`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = getResumeDisplayName() || 'resume.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', decodeURIComponent(filename));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Resume downloaded successfully!');
    } catch (err) {
      console.error("Download error:", err);
      showToast('Failed to download resume', 'error');
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;
    
    try {
      await axios.delete(`${API_URL}/users/delete-resume`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setForm({ ...form, resume_url: '' });
      showToast('Resume deleted successfully');
    } catch (err) {
      console.error("Delete error:", err);
      showToast('Failed to delete resume', 'error');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showToast('Profile updated successfully!');
      
    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data || err.message);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() !== "" && !form.skills.includes(skillInput.trim())) {
      setForm({
        ...form,
        skills: [...form.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setForm({
      ...form,
      skills: form.skills.filter((_, i) => i !== index)
    });
  };

  const addInterest = () => {
    if (interestInput.trim() !== "" && !form.interests.includes(interestInput.trim())) {
      setForm({
        ...form,
        interests: [...form.interests, interestInput.trim()]
      });
      setInterestInput("");
    }
  };

  const removeInterest = (index) => {
    setForm({
      ...form,
      interests: form.interests.filter((_, i) => i !== index)
    });
  };

  const tabs = [
    { id: "basics", label: "Basics", icon: User },
    { id: "bio", label: "Bio", icon: BookOpen },
    { id: "skills", label: "Skills", icon: GraduationCap },
    { id: "interests", label: "Interests", icon: Briefcase },
    { id: "resume", label: "Resume", icon: FileText },
  ];

  // Add instructor tab if user is instructor
  if (isInstructor) {
    tabs.push({ id: "instructor", label: "Instructor Status", icon: CheckCircle });
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'approved':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full border border-red-200">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Rejected</span>
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Under Review</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Not Applied</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex">
        <ProfileSidebar />
        <div className="flex-1 px-10 py-20 flex justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex bg-gray-50/50">
      
      {/* LEFT SIDEBAR */}
      <ProfileSidebar />

      {/* RIGHT CONTENT */}
      <div className="flex-1 px-8 lg:px-10 py-8">
        
        {/* Header with gradient */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Edit Profile
              </h1>
              <p className="text-gray-500 mt-1">
                Update your personal information and public profile
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primaryHover hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* BASICS TAB */}
          {activeTab === "basics" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    First name
                  </label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    Last name
                  </label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white"
                  />
                </div>

                {/* Headline */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Professional Headline
                  </label>
                  <input
                    name="headline"
                    value={form.headline}
                    onChange={handleChange}
                    placeholder="e.g. Senior Web Developer | Teaching React since 2020"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white"
                  />
                  <p className="text-xs text-gray-500">Appears below your name on your profile</p>
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Current Occupation
                  </label>
                  <input
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white"
                  />
                </div>

                {/* Field of Learning */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    Field of Expertise
                  </label>
                  <input
                    name="field_of_learning"
                    value={form.field_of_learning}
                    onChange={handleChange}
                    placeholder="e.g. Web Development, Data Science"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BIO TAB */}
          {activeTab === "bio" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                About You
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Biography</label>
                <textarea
                  name="biography"
                  value={form.biography}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white h-48 resize-none"
                  placeholder="Tell learners about yourself, your experience, and what you're passionate about teaching..."
                />
                <p className="text-xs text-gray-500">
                  {form.biography.length} characters. Minimum 50 recommended.
                </p>
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === "skills" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                Your Skills
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Skills you can teach
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="group px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-50 text-primary rounded-xl text-sm flex items-center gap-2 border border-primary/20 hover:border-primary/40 transition-all"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {form.skills.length === 0 && (
                      <p className="text-gray-400 text-sm italic">No skills added yet</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="e.g. React, Python, UI Design"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INTERESTS TAB */}
          {activeTab === "interests" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                Your Interests
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Topics you're interested in
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="group px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-xl text-sm flex items-center gap-2 border border-purple-200 hover:border-purple-300 transition-all"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {form.interests.length === 0 && (
                      <p className="text-gray-400 text-sm italic">No interests added yet</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                      placeholder="e.g. Machine Learning, Web3, Design"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition bg-gray-50/50 hover:bg-white focus:bg-white"
                    />
                    <button
                      onClick={addInterest}
                      className="px-4 py-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESUME TAB */}
          {activeTab === "resume" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                Resume / CV
              </h2>

              <div className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-primary transition-all">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-lg font-medium text-gray-900 mb-1">
                      {uploading ? 'Uploading...' : 'Upload your resume'}
                    </span>
                    <span className="text-sm text-gray-500 text-center mb-2">
                      PDF, DOC, DOCX (Max 5MB)
                    </span>
                    {uploading && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin mt-2" />
                    )}
                  </label>
                </div>

                {/* Current Resume */}
                {form.resume_url && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getResumeDisplayName()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded resume • Click to download
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadResume}
                          className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 text-sm border border-gray-200"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={handleDeleteResume}
                          className="px-3 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2 text-sm border border-gray-200"
                        >
                          <X className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  Your resume helps us verify your expertise. It will not be shared publicly.
                </p>
              </div>
            </div>
          )}

          {/* INSTRUCTOR STATUS TAB */}
          {activeTab === "instructor" && isInstructor && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                Instructor Application Status
              </h2>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Current Status</p>
                      <StatusBadge status={applicationStatus} />
                    </div>
                  </div>
                  
                  {applicationStatus === 'approved' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ You can now create and publish courses!
                      </p>
                    </div>
                  )}
                  
                  {applicationStatus === 'rejected' && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-700">
                        Your application was not approved. You can reapply after 30 days.
                      </p>
                    </div>
                  )}
                  
                  {applicationStatus === 'pending' && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        Your application is being reviewed. We'll notify you within 48 hours.
                      </p>
                    </div>
                  )}
                  
                  {!applicationStatus && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        You haven't submitted an instructor application yet.
                      </p>
                      <button
                        onClick={() => window.location.href = '/teach'}
                        className="mt-2 text-primary hover:text-primaryHover text-sm font-medium"
                      >
                        Apply to become an instructor →
                      </button>
                    </div>
                  )}
                </div>

                {/* Application Timeline */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Application Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Submit application and resume</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        applicationStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : 
                        applicationStatus ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-gray-600">Admin review (24-48 hours)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        applicationStatus === 'approved' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-gray-600">Approval & dashboard access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        applicationStatus === 'approved' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-gray-600">Start creating courses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky save button for mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primaryHover hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}