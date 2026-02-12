import { useState, useEffect } from "react";
import axios from "axios";
import ProfileSidebar from "../../components/ProfileSidebar";
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  User
} from "lucide-react";

export default function EditPhoto() {
  const user = JSON.parse(localStorage.getItem("user"));
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [preview, setPreview] = useState(user?.photo_url || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Optional: refresh preview if user changes elsewhere
  useEffect(() => {
    setPreview(user?.photo_url || "");
  }, [user?.photo_url]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    handleFile(selected);
  };

  const handleFile = (selected) => {
    if (selected) {
      // Check file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(selected.type)) {
        alert("Please upload a JPG or PNG image");
        return;
      }

      // Check file size (2MB max)
      if (selected.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB");
        return;
      }

      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setUploadSuccess(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(user?.photo_url || "");
    setUploadSuccess(false);
  };

  const token = user?.token || localStorage.getItem("accessToken");

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image first");
      return;
    }

    setLoading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await axios.post(
        `${API_URL}/users/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update localStorage with new user data
      const updatedUser = { ...user, photo_url: res.data.photo_url };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setPreview(res.data.photo_url);
      setFile(null);
      setUploadSuccess(true);
      
      // Show success message and auto-hide after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
      
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Upload failed — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex bg-gray-50/50 min-h-screen">
      
      {/* LEFT SIDEBAR */}
      <ProfileSidebar />

      {/* RIGHT CONTENT */}
      <div className="flex-1 px-8 lg:px-10 py-8">
        
        {/* Header with gradient */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-purple-200 rounded-2xl">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Profile Photo
              </h1>
              <p className="text-gray-500 mt-1">
                Upload a professional photo to make your profile stand out
              </p>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-slide-in">
            <div className="p-1 bg-green-500 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <p className="text-green-700 font-medium flex-1">
              Photo updated successfully!
            </p>
            <button 
              onClick={() => setUploadSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - PREVIEW */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                Preview
              </h2>
              
              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                  {/* Image Preview */}
                  <div className="relative">
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="Profile preview"
                          className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-xl">
                        <User className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Remove button (only when custom file is selected) */}
                  {file && (
                    <button
                      onClick={handleRemove}
                      className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition group"
                    >
                      <X className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Recommended: 400x400px or larger
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG or PNG, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - UPLOAD */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              
              {/* Upload Area */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                  Upload New Photo
                </h2>

                {/* Drag & Drop Zone */}
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-8 transition-all
                    ${dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50/50'
                    }
                    ${file ? 'bg-green-50/30 border-green-300' : ''}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {!file ? (
                      <>
                        <div className={`
                          p-4 rounded-full mb-4 transition-all
                          ${dragActive 
                            ? 'bg-primary text-white scale-110' 
                            : 'bg-primary/10 text-primary'
                          }
                        `}>
                          <Upload className="w-8 h-8" />
                        </div>
                        <span className="text-lg font-medium text-gray-900 mb-2">
                          {dragActive ? 'Drop your photo here' : 'Drag & drop or click to upload'}
                        </span>
                        <span className="text-sm text-gray-500 text-center mb-1">
                          Choose a JPG or PNG file (max 2MB)
                        </span>
                        <span className="text-xs text-gray-400">
                          For best results, use a square image
                        </span>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-green-600 mt-2">
                          Ready to upload
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                    transition-all transform hover:-translate-y-0.5
                    ${loading || !file
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primaryHover hover:to-purple-700 shadow-lg shadow-purple-200'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </>
                  )}
                </button>

                {/* Cancel button - only shows when file is selected */}
                {file && (
                  <button
                    onClick={handleRemove}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                )}
              </div>

              {/* Tips Section */}
              <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Photo Tips
                    </h3>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Use a recent, clear headshot</li>
                      <li>• Face should be clearly visible</li>
                      <li>• Avoid group photos or logos</li>
                      <li>• Good lighting makes a difference</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}